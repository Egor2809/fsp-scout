import {
  AcceptInvitationBody,
  CreateInvitationBody,
  DeclineInvitationBody,
  PostponeInvitationBody,
  PrecheckInvitationBody,
  UpdateInvitationStageBody,
  WithdrawInvitationBody,
} from '@/api/generated/zod/scout.zod'
import type { InvitationQuota, InvitationStats, InvitationStatus } from '@/api/generated/model'
import { ACTIVE_INVITATION_STATUSES, canTransition } from '@/lib/invitationStatus'
import type { InvitationRec, MockDb } from '../db/types'
import { invitationView } from '../lib/views'
import { json, notFound, parseBody, problem, route, salaryRangeProblem, validationProblem } from '../http'
import { visibleCandidate } from './employer'

const DAY = 24 * 3600 * 1000

/** Начало календарной недели (пн 00:00 по Москве, UTC+3). */
export function weekStart(now: Date): Date {
  const msk = new Date(now.getTime() + 3 * 3600 * 1000)
  const day = (msk.getUTCDay() + 6) % 7
  const startMsk = Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate() - day)
  return new Date(startMsk - 3 * 3600 * 1000)
}

export function quotaFor(db: MockDb, companyId: string, now: Date): InvitationQuota {
  const start = weekStart(now)
  const end = new Date(start.getTime() + 7 * DAY)
  const company = db.companies.find((c) => c.id === companyId)
  const recent = db.invitations.filter((i) => i.companyId === companyId && i.sentAt && now.getTime() - new Date(i.sentAt).getTime() <= 90 * DAY)
  const responded = recent.filter((i) => i.response && i.response.decision !== 'postponed')
  const accepted = responded.filter((i) => i.response?.decision === 'accepted').length
  const acceptanceRate = responded.length ? accepted / responded.length : 0
  // Квота растёт с долей принятых инвайтов: до +10 к базе
  const bonus = Math.round(acceptanceRate * 10)
  const limit = (company?.quotaBase ?? 20) + bonus
  const used = db.invitations.filter((i) => i.companyId === companyId && i.sentAt && new Date(i.sentAt) >= start && new Date(i.sentAt) < end).length
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    period_start: start.toISOString(),
    period_end: end.toISOString(),
    acceptance_rate: Math.round(acceptanceRate * 100) / 100,
    bonus,
  }
}

function activeInvitation(db: MockDb, companyId: string, candidateId: string): InvitationRec | undefined {
  return db.invitations.find((i) => i.companyId === companyId && i.candidateId === candidateId && ACTIVE_INVITATION_STATUSES.includes(i.status))
}

function pushEvent(inv: InvitationRec, status: InvitationStatus, actor: 'candidate' | 'employer' | 'system', at: string, note: string | null = null) {
  inv.status = status
  inv.events.push({ id: crypto.randomUUID(), at, status, actor, note })
}

const notActionable = (inv: InvitationRec, what: string) =>
  problem(409, 'invitation_not_actionable', 'Действие недоступно', `Нельзя ${what}: инвайт в статусе «${inv.status}».`)

export const invitationHandlers = [
  route.employer('get', '/company/invitation-quota', ({ ctx }) => json(quotaFor(ctx.db, ctx.companyId, ctx.now))),

  route.employer('get', '/invitations', ({ ctx, url }) => {
    const statuses = url.searchParams.getAll('status')
    const candidateId = url.searchParams.get('candidate_id')
    const list = ctx.db.invitations
      .filter((i) => i.companyId === ctx.companyId)
      .filter((i) => !statuses.length || statuses.includes(i.status))
      .filter((i) => !candidateId || i.candidateId === candidateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((i) => invitationView(ctx.db, i, 'employer'))
    return json(list)
  }),

  route.employer('post', '/invitations/precheck', ({ ctx, body }) => {
    const parsed = parseBody(PrecheckInvitationBody, body)
    if (!parsed.ok) return parsed.response
    const { candidate_id, salary } = parsed.data
    const salaryErr = salaryRangeProblem(salary)
    if (salaryErr) return salaryErr
    const c = visibleCandidate(ctx.db, candidate_id, ctx.companyId)
    if (!c) return notFound('Кандидат')
    // Ограничение частоты: порог нельзя подобрать перебором
    const hourAgo = ctx.now.getTime() - 3600 * 1000
    ctx.db.prechecks = ctx.db.prechecks.filter((p) => new Date(p.at).getTime() > hourAgo)
    const count = ctx.db.prechecks.filter((p) => p.companyId === ctx.companyId && p.candidateId === c.id).length
    if (count >= 30) return problem(429, 'rate_limited', 'Слишком много проверок', 'Попробуйте через час.')
    ctx.db.prechecks.push({ companyId: ctx.companyId, candidateId: c.id, at: ctx.now.toISOString() })
    const quota = quotaFor(ctx.db, ctx.companyId, ctx.now)
    const salaryOk = c.privacy.salaryFloor === null || salary.to >= c.privacy.salaryFloor
    const alreadyInvited = Boolean(activeInvitation(ctx.db, ctx.companyId, c.id))
    const available = c.availability !== 'not_looking'
    return json({ can_send: salaryOk && !alreadyInvited && available && quota.remaining > 0, salary_ok: salaryOk, already_invited: alreadyInvited, candidate_available: available, quota })
  }),

  route.employer('post', '/invitations', ({ ctx, body }) => {
    const parsed = parseBody(CreateInvitationBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const salaryErr = salaryRangeProblem(d.salary)
    if (salaryErr) return salaryErr
    const c = visibleCandidate(ctx.db, d.candidate_id, ctx.companyId)
    if (!c) return notFound('Кандидат')
    if (d.vacancy_id && !ctx.db.vacancies.some((v) => v.id === d.vacancy_id && v.companyId === ctx.companyId)) {
      return validationProblem([{ pointer: '/vacancy_id', detail: 'Вакансия не найдена' }])
    }
    if (c.availability === 'not_looking') return problem(409, 'candidate_unavailable', 'Кандидат не ищет работу', 'Кандидат сейчас не рассматривает предложения.')
    if (activeInvitation(ctx.db, ctx.companyId, c.id)) return problem(409, 'already_invited', 'Инвайт уже отправлен', 'У кандидата есть активный инвайт от вашей компании.')
    const quota = quotaFor(ctx.db, ctx.companyId, ctx.now)
    if (quota.remaining <= 0) return problem(429, 'quota_exceeded', 'Квота инвайтов исчерпана', 'Лимит инвайтов на эту неделю исчерпан. Квота растёт с долей принятых инвайтов.', { quota })
    if (c.privacy.salaryFloor !== null && d.salary.to < c.privacy.salaryFloor) {
      return problem(422, 'salary_below_floor', 'Вилка ниже ожиданий кандидата', 'Верхняя граница вилки ниже минимального порога, который задал кандидат. Инвайт не отправлен.')
    }
    const nowIso = ctx.now.toISOString()
    const inv: InvitationRec = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      candidateId: c.id,
      status: 'sent',
      title: d.title.trim(),
      description: d.description.trim(),
      salary: d.salary,
      workFormat: d.work_format,
      city: d.city ?? null,
      contactPerson: d.contact_person.trim(),
      contact: d.contact,
      vacancyId: d.vacancy_id ?? null,
      source: d.source ?? { type: 'search', id: null },
      createdAt: nowIso,
      sentAt: nowIso,
      viewedAt: null,
      expiresAt: new Date(ctx.now.getTime() + d.response_days * DAY).toISOString(),
      response: null,
      postponedOnce: false,
      events: [{ id: crypto.randomUUID(), at: nowIso, status: 'sent', actor: 'employer', note: null }],
    }
    ctx.db.invitations.push(inv)
    return json(invitationView(ctx.db, inv, 'employer'), 201)
  }),

  route.employer('get', '/invitations/stats', ({ ctx, url }) => {
    const days = Math.min(365, Math.max(7, Number(url.searchParams.get('days') ?? '90') || 90))
    const from = ctx.now.getTime() - days * DAY
    const list = ctx.db.invitations.filter((i) => i.companyId === ctx.companyId && i.sentAt && new Date(i.sentAt).getTime() >= from)
    const reached = (s: InvitationStatus) => list.filter((i) => i.events.some((e) => e.status === s)).length
    const funnel: InvitationStats['funnel'] = {
      sent: list.length,
      viewed: list.filter((i) => i.events.some((e) => e.status !== 'sent' && e.actor === 'candidate')).length,
      accepted: reached('accepted'),
      declined: reached('declined'),
      postponed: reached('postponed'),
      expired: reached('expired'),
      withdrawn: reached('withdrawn'),
      interview: reached('interview'),
      offer: reached('offer'),
      hired: reached('hired'),
    }
    const reasons = new Map<string, number>()
    for (const i of list) if (i.response?.decision === 'declined' && i.response.reason) reasons.set(i.response.reason, (reasons.get(i.response.reason) ?? 0) + 1)
    const responseHours = list
      .filter((i) => i.response && i.sentAt)
      .map((i) => (new Date(i.response!.responded_at).getTime() - new Date(i.sentAt!).getTime()) / 3600_000)
      .sort((a, b) => a - b)
    const responded = funnel.accepted + funnel.declined
    const stats: InvitationStats = {
      days,
      funnel,
      decline_reasons: [...reasons.entries()].map(([reason, count]) => ({ reason: reason as never, count })).sort((a, b) => b.count - a.count),
      acceptance_rate: responded ? Math.round((funnel.accepted / responded) * 100) / 100 : 0,
      median_response_hours: responseHours.length ? Math.round(responseHours[Math.floor(responseHours.length / 2)]! * 10) / 10 : null,
    }
    return json(stats)
  }),

  route.candidate('get', '/me/invitations', ({ ctx, url }) => {
    const statuses = url.searchParams.getAll('status')
    const list = ctx.db.invitations
      .filter((i) => i.candidateId === ctx.candidate.id && i.status !== 'draft')
      .filter((i) => !statuses.length || statuses.includes(i.status))
      .sort((a, b) => (b.sentAt ?? b.createdAt).localeCompare(a.sentAt ?? a.createdAt))
      .map((i) => invitationView(ctx.db, i, 'candidate'))
    return json(list)
  }),

  route.roles(['candidate', 'employer'], 'get', '/invitations/:invitationId', ({ ctx, params }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId))
    if (!inv) return notFound('Инвайт')
    if (ctx.user.role === 'candidate') {
      if (inv.candidateId !== ctx.user.candidateId || inv.status === 'draft') return notFound('Инвайт')
      return json(invitationView(ctx.db, inv, 'candidate'))
    }
    if (inv.companyId !== ctx.user.companyId) return notFound('Инвайт')
    return json(invitationView(ctx.db, inv, 'employer'))
  }),

  route.candidate('post', '/invitations/:invitationId/view', ({ ctx, params }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId) && i.candidateId === ctx.candidate.id && i.status !== 'draft')
    if (!inv) return notFound('Инвайт')
    if (inv.status === 'sent') {
      const at = ctx.now.toISOString()
      inv.viewedAt = at
      pushEvent(inv, 'viewed', 'candidate', at)
    }
    return json(invitationView(ctx.db, inv, 'candidate'))
  }),

  route.candidate('post', '/invitations/:invitationId/accept', ({ ctx, params, body }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId) && i.candidateId === ctx.candidate.id && i.status !== 'draft')
    if (!inv) return notFound('Инвайт')
    if (!canTransition(inv.status, 'accepted', 'candidate')) return notActionable(inv, 'принять')
    const parsed = parseBody(AcceptInvitationBody, body)
    if (!parsed.ok) return parsed.response
    const c = ctx.candidate
    const channel = parsed.data.channel
    const available = channel === 'email' ? Boolean(c.email) : channel === 'phone' ? Boolean(c.phone) : Boolean(c.telegram)
    if (!available) return validationProblem([{ pointer: '/channel', detail: 'Этот канал не заполнен в профиле — добавьте контакт или выберите другой' }])
    if (parsed.data.call_slot && new Date(parsed.data.call_slot).getTime() < ctx.now.getTime()) {
      return validationProblem([{ pointer: '/call_slot', detail: 'Слот созвона должен быть в будущем' }])
    }
    const at = ctx.now.toISOString()
    if (!inv.viewedAt) inv.viewedAt = at
    inv.response = {
      decision: 'accepted',
      reason: null,
      comment: parsed.data.message ?? null,
      channel,
      call_slot: parsed.data.call_slot ?? null,
      postponed_until: null,
      responded_at: at,
    }
    pushEvent(inv, 'accepted', 'candidate', at, parsed.data.message ?? null)
    // Раскрытие контактов компании — запись в журнал
    if (!ctx.db.reveals.some((r) => r.companyId === inv.companyId && r.candidateId === c.id)) {
      ctx.db.reveals.push({ companyId: inv.companyId, candidateId: c.id, reason: 'invitation_accepted', sourceId: inv.id, at })
    }
    c.preferredChannel = channel
    return json(invitationView(ctx.db, inv, 'candidate'))
  }),

  route.candidate('post', '/invitations/:invitationId/decline', ({ ctx, params, body }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId) && i.candidateId === ctx.candidate.id && i.status !== 'draft')
    if (!inv) return notFound('Инвайт')
    if (!canTransition(inv.status, 'declined', 'candidate')) return notActionable(inv, 'отклонить')
    const parsed = parseBody(DeclineInvitationBody, body)
    if (!parsed.ok) return parsed.response
    const comment = parsed.data.comment?.trim() || null
    if (parsed.data.reason === 'other' && !comment) return validationProblem([{ pointer: '/comment', detail: 'Опишите причину' }])
    const at = ctx.now.toISOString()
    inv.response = { decision: 'declined', reason: parsed.data.reason, comment, channel: null, call_slot: null, postponed_until: null, responded_at: at }
    pushEvent(inv, 'declined', 'candidate', at, comment)
    return json(invitationView(ctx.db, inv, 'candidate'))
  }),

  route.candidate('post', '/invitations/:invitationId/postpone', ({ ctx, params, body }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId) && i.candidateId === ctx.candidate.id && i.status !== 'draft')
    if (!inv) return notFound('Инвайт')
    if (inv.postponedOnce || !canTransition(inv.status, 'postponed', 'candidate')) return notActionable(inv, 'отложить')
    const parsed = parseBody(PostponeInvitationBody, body ?? {})
    if (!parsed.ok) return parsed.response
    const until = parsed.data.until ?? null
    if (until) {
      const untilTime = new Date(`${until}T23:59:59Z`).getTime()
      if (untilTime < ctx.now.getTime() - DAY) return validationProblem([{ pointer: '/until', detail: 'Дата в прошлом' }])
      if (new Date(`${until}T00:00:00Z`).getTime() > new Date(inv.expiresAt).getTime()) {
        return validationProblem([{ pointer: '/until', detail: 'Не позже срока ответа на инвайт' }])
      }
    }
    const at = ctx.now.toISOString()
    if (!inv.viewedAt) inv.viewedAt = at
    inv.response = { decision: 'postponed', reason: null, comment: null, channel: null, call_slot: null, postponed_until: until, responded_at: at }
    inv.postponedOnce = true
    pushEvent(inv, 'postponed', 'candidate', at)
    return json(invitationView(ctx.db, inv, 'candidate'))
  }),

  route.employer('post', '/invitations/:invitationId/withdraw', ({ ctx, params, body }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId) && i.companyId === ctx.companyId)
    if (!inv) return notFound('Инвайт')
    if (!canTransition(inv.status, 'withdrawn', 'employer')) return notActionable(inv, 'отозвать')
    const parsed = parseBody(WithdrawInvitationBody, body ?? {})
    if (!parsed.ok) return parsed.response
    pushEvent(inv, 'withdrawn', 'employer', ctx.now.toISOString(), parsed.data.note ?? null)
    return json(invitationView(ctx.db, inv, 'employer'))
  }),

  route.employer('post', '/invitations/:invitationId/stage', ({ ctx, params, body }) => {
    const inv = ctx.db.invitations.find((i) => i.id === String(params.invitationId) && i.companyId === ctx.companyId)
    if (!inv) return notFound('Инвайт')
    const parsed = parseBody(UpdateInvitationStageBody, body)
    if (!parsed.ok) return parsed.response
    if (!canTransition(inv.status, parsed.data.status, 'employer')) return notActionable(inv, 'сменить этап')
    pushEvent(inv, parsed.data.status, 'employer', ctx.now.toISOString(), parsed.data.note ?? null)
    return json(invitationView(ctx.db, inv, 'employer'))
  }),
]
