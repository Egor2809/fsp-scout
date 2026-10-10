import {
  ConfirmNeedBody,
  CreateNeedBody,
  CreateSearchBody,
  LinkMyFspBody,
  RefineSearchBody,
  UpdateMyCompanyBody,
} from '@/api/generated/zod/scout.zod'
import type { FspAchievement, Grade, Need, SearchFilters, SearchResultItem, Specialization } from '@/api/generated/model'
import { formatSalaryRangeShort } from '@/lib/format'
import { categoryLabel, gradeLabel, workFormatLabel } from '@/lib/labels'
import { SKILL_BY_ID, skillName, skillRef } from '../data/taxonomy'
import type { CandidateRec, MockDb, SearchRec } from '../db/types'
import { explainMatch, passesHardFilters, strengthParts } from '../lib/matching'
import { parseNeed } from '../lib/needParser'
import { recommendCategories, salaryRadar } from '../lib/radar'
import { aliasFor, candidateCard, candidateDetail, findCompany, fspProfileView } from '../lib/views'
import { json, notFound, pageParams, paginate, parseBody, problem, route, salaryRangeProblem, validationProblem } from '../http'

/** Мок реестра ФСП: по известным ID «подтягиваются» достижения. */
const FSP_REGISTRY: Record<string, (now: Date) => FspAchievement[]> = {
  'FSP-77-123456': (now) => [
    {
      id: crypto.randomUUID(),
      event_id: `fsp-${now.getFullYear()}-product-national-412`,
      title: `Чемпионат России по продуктовому программированию ${now.getFullYear()}`,
      date: `${now.getFullYear()}-04-20`,
      level: 'national',
      discipline: 'product',
      format: 'team',
      team: 'Ctrl+Alt+Win',
      role: 'Frontend',
      place: 7,
      participants_total: 980,
      percentile: 99,
      result: 'finalist',
      sport_rank: 'I разряд',
      certificate_url: null,
      verified: true,
    },
  ],
}

export function companyOfUser(db: MockDb, companyId: string) {
  return findCompany(db, companyId)
}

export function visibleCandidate(db: MockDb, id: string, companyId: string): CandidateRec | null {
  const c = db.candidates.find((x) => x.id === id)
  if (!c || !c.standing) return null
  if (c.privacy.hiddenCompanyIds.includes(companyId)) return null
  const pv = c.consents.find((x) => x.type === 'profile_visibility')
  const hasRelation = db.reveals.some((r) => r.companyId === companyId && r.candidateId === id) || db.invitations.some((i) => i.companyId === companyId && i.candidateId === id)
  // Скрытый (без согласия на показ) профиль доступен компании только при уже существующей связи
  if ((!pv || pv.revoked_at) && !hasRelation) return null
  return c
}

function filtersDiffLabel(prev: SearchFilters, next: SearchFilters): string {
  const parts: string[] = []
  const added = (a: string[], b: string[]) => b.filter((x) => !a.includes(x))
  const removed = (a: string[], b: string[]) => a.filter((x) => !b.includes(x))
  for (const id of added(prev.must_skills, next.must_skills)) parts.push(`+ ${skillName(id)} обязательно`)
  for (const id of removed(prev.must_skills, next.must_skills)) parts.push(`− ${skillName(id)} из обязательных`)
  for (const id of added(prev.nice_skills, next.nice_skills)) parts.push(`+ ${skillName(id)} желательно`)
  for (const g of added(prev.grades, next.grades) as Grade[]) parts.push(`+ ${gradeLabel[g]}`)
  for (const g of removed(prev.grades, next.grades) as Grade[]) parts.push(`− ${gradeLabel[g]}`)
  if (prev.work_formats.join() !== next.work_formats.join()) parts.push(`Формат: ${next.work_formats.map((f) => workFormatLabel[f].toLowerCase()).join(', ')}`)
  if (prev.city !== next.city) parts.push(next.city ? `Город: ${next.city}` : 'Любой город')
  if (prev.salary.from !== next.salary.from || prev.salary.to !== next.salary.to) parts.push(`Вилка ${formatSalaryRangeShort(next.salary)}`)
  if (prev.fsp_only !== next.fsp_only) parts.push(next.fsp_only ? 'Только с ФСП' : 'С ФСП и без')
  if (prev.fsp_level_min !== next.fsp_level_min) parts.push(next.fsp_level_min ? 'Уровень ФСП ≥ всероссийский' : 'Любой уровень ФСП')
  if (prev.specialization !== next.specialization) parts.push(`Специализация: ${next.specialization}`)
  if (prev.include_relocation !== next.include_relocation) parts.push(next.include_relocation ? '+ готовые к переезду' : '− без переезда')
  if (prev.industries.join() !== next.industries.join()) parts.push('Отрасль изменена')
  if (prev.availability.join() !== next.availability.join()) parts.push(next.availability.length === 1 ? 'Только ищущие активно' : 'Активные и открытые')
  return parts.length ? parts.slice(0, 3).join(' · ') : 'Без изменений'
}

export function rankCandidates(db: MockDb, filters: SearchFilters, companyId: string, now: Date) {
  return db.candidates
    .filter((c) => passesHardFilters(c, filters, companyId))
    .map((c) => ({ c, ex: explainMatch(c, filters, now) }))
    .sort((a, b) => b.ex.score - a.ex.score)
}

function searchView(db: MockDb, s: SearchRec, now: Date) {
  const { companyId, ...rest } = s
  return {
    ...rest,
    versions: s.versions.map((v) => ({ ...v, results_total: rankCandidates(db, v.filters, companyId, now).length })),
    shortlist: s.shortlist.map((e) => {
      const c = db.candidates.find((x) => x.id === e.candidate_id)
      return {
        ...e,
        alias: aliasFor(companyId, e.candidate_id),
        category: c?.standing ? { specialization: c.standing.specialization, grade: c.standing.grade, label: categoryLabel(c.standing.specialization, c.standing.grade) } : e.category,
      }
    }),
  }
}

function needView(n: MockDb['needs'][number]): Need {
  const { companyId: _omit, ...rest } = n
  return rest
}

function validateSkills(ids: string[], pointer: string) {
  const idx = ids.findIndex((id) => !SKILL_BY_ID.has(id))
  return idx >= 0 ? validationProblem([{ pointer: `${pointer}/${idx}`, detail: 'Навык не найден в справочнике' }]) : null
}

export const employerHandlers = [
  // ───────────── ФСП (кандидат) ─────────────
  route.candidate('get', '/me/fsp', ({ ctx }) => json(fspProfileView(ctx.candidate, ctx.now))),

  route.candidate('post', '/me/fsp/link', ({ ctx, body }) => {
    const c = ctx.candidate
    const consent = c.consents.find((x) => x.type === 'fsp_data')
    if (!consent || consent.revoked_at) {
      return problem(403, 'consent_required', 'Нужно согласие', 'Дайте согласие на получение данных ФСП, чтобы привязать ФСП ID.', { consent_types: ['fsp_data'] })
    }
    const parsed = parseBody(LinkMyFspBody, body)
    if (!parsed.ok) return parsed.response
    const fspId = parsed.data.fsp_id
    const takenBy = ctx.db.candidates.find((x) => x.id !== c.id && x.fsp.fspId === fspId)
    if (takenBy) return problem(409, 'fsp_already_linked', 'ФСП ID уже привязан', 'Этот ФСП ID привязан к другому профилю. Обратитесь в поддержку.')
    const known = FSP_REGISTRY[fspId]
    // Любой корректный ID считается участником реестра; известные ID приходят с достижениями
    c.fsp = { linked: true, fspId, verifiedAt: ctx.now.toISOString(), achievements: known ? known(ctx.now) : [] }
    c.updatedAt = ctx.now.toISOString()
    return json(fspProfileView(c, ctx.now))
  }),

  route.candidate('delete', '/me/fsp/link', ({ ctx }) => {
    ctx.candidate.fsp = { linked: false, fspId: null, verifiedAt: null, achievements: [] }
    return json(fspProfileView(ctx.candidate, ctx.now))
  }),

  // ───────────── Компания ─────────────
  route.employer('get', '/company', ({ ctx }) => {
    const co = companyOfUser(ctx.db, ctx.companyId)
    if (!co) return notFound('Компания')
    const { quotaBase: _omit, ...company } = co
    return json(company)
  }),

  route.employer('put', '/company', ({ ctx, body }) => {
    const co = companyOfUser(ctx.db, ctx.companyId)
    if (!co) return notFound('Компания')
    const parsed = parseBody(UpdateMyCompanyBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    Object.assign(co, {
      name: d.name.trim(),
      industry: d.industry,
      description: d.description,
      website: d.website ?? null,
      city: d.city ?? null,
      size: d.size,
      inn: d.inn ?? null,
      contact_email: d.contact_email,
      contact_phone: d.contact_phone ?? null,
    })
    const { quotaBase: _omit, ...company } = co
    return json(company)
  }),

  // ───────────── Потребности ─────────────
  route.employer('post', '/needs', ({ ctx, body }) => {
    const parsed = parseBody(CreateNeedBody, body)
    if (!parsed.ok) return parsed.response
    const nowIso = ctx.now.toISOString()
    const need = { id: crypto.randomUUID(), companyId: ctx.companyId, raw_text: parsed.data.raw_text, parsed: parseNeed(parsed.data.raw_text), confirmed: null, created_at: nowIso, updated_at: nowIso }
    ctx.db.needs.push(need)
    return json(needView(need), 201)
  }),

  route.employer('get', '/needs/:needId', ({ ctx, params }) => {
    const need = ctx.db.needs.find((n) => n.id === String(params.needId) && n.companyId === ctx.companyId)
    return need ? json(needView(need)) : notFound('Потребность')
  }),

  route.employer('put', '/needs/:needId', ({ ctx, params, body }) => {
    const need = ctx.db.needs.find((n) => n.id === String(params.needId) && n.companyId === ctx.companyId)
    if (!need) return notFound('Потребность')
    const parsed = parseBody(ConfirmNeedBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const salaryErr = salaryRangeProblem(d.salary)
    if (salaryErr) return salaryErr
    const skillsErr = validateSkills(d.must_skills, '/must_skills') ?? validateSkills(d.nice_skills, '/nice_skills')
    if (skillsErr) return skillsErr
    need.confirmed = {
      specialization: d.specialization,
      grade: d.grade,
      must_skills: [...new Set(d.must_skills)].map(skillRef),
      nice_skills: [...new Set(d.nice_skills)].filter((id) => !d.must_skills.includes(id)).map(skillRef),
      work_formats: d.work_formats,
      city: d.city ?? null,
      industry: d.industry ?? null,
      salary: d.salary,
    }
    need.updated_at = ctx.now.toISOString()
    return json(needView(need))
  }),

  route.employer('get', '/needs/:needId/categories', ({ ctx, params }) => {
    const need = ctx.db.needs.find((n) => n.id === String(params.needId) && n.companyId === ctx.companyId)
    if (!need) return notFound('Потребность')
    if (!need.confirmed) return problem(409, 'need_not_confirmed', 'Потребность не подтверждена', 'Подтвердите чипы и укажите вилку.')
    const conf = need.confirmed
    return json({ need_id: need.id, salary: conf.salary, items: recommendCategories(ctx.db, conf, ctx.companyId) })
  }),

  route.employer('get', '/salary-radar', ({ ctx, url }) => {
    const spec = url.searchParams.get('specialization') as Specialization | null
    const grade = url.searchParams.get('grade') as Grade | null
    const from = Number(url.searchParams.get('salary_from'))
    const to = Number(url.searchParams.get('salary_to'))
    const errors = []
    if (!spec) errors.push({ pointer: '/specialization', detail: 'Обязательный параметр' })
    if (!grade) errors.push({ pointer: '/grade', detail: 'Обязательный параметр' })
    if (!Number.isInteger(from) || from < 10_000) errors.push({ pointer: '/salary_from', detail: 'Не меньше 10 000 ₽' })
    if (!Number.isInteger(to) || to < 10_000) errors.push({ pointer: '/salary_to', detail: 'Не меньше 10 000 ₽' })
    if (errors.length || !spec || !grade) return validationProblem(errors)
    if (from > to) return validationProblem([{ pointer: '/salary_to', detail: 'Верхняя граница должна быть не меньше нижней' }], 'salary_range_invalid')
    return json(salaryRadar(ctx.db, spec, grade, { from, to }, ctx.companyId))
  }),

  // ───────────── Подборки ─────────────
  route.employer('get', '/searches', ({ ctx }) =>
    json(
      ctx.db.searches
        .filter((s) => s.companyId === ctx.companyId)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .map((s) => searchView(ctx.db, s, ctx.now)),
    ),
  ),

  route.employer('post', '/searches', ({ ctx, body }) => {
    const parsed = parseBody(CreateSearchBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const filters = d.filters as SearchFilters
    const salaryErr = salaryRangeProblem(filters.salary, '/filters/salary')
    if (salaryErr) return salaryErr
    const skillsErr = validateSkills(filters.must_skills, '/filters/must_skills') ?? validateSkills(filters.nice_skills, '/filters/nice_skills')
    if (skillsErr) return skillsErr
    if (d.need_id && !ctx.db.needs.some((n) => n.id === d.need_id && n.companyId === ctx.companyId)) return notFound('Потребность')
    const nowIso = ctx.now.toISOString()
    const title =
      d.title?.trim() ||
      `${categoryLabel(filters.specialization, filters.grades[0] ?? 'middle')}${filters.must_skills.length ? `: ${filters.must_skills.slice(0, 3).map(skillName).join(', ')}` : ''}`
    const search: SearchRec = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      need_id: d.need_id ?? null,
      title,
      created_at: nowIso,
      updated_at: nowIso,
      current_version: 1,
      versions: [{ version: 1, created_at: nowIso, label: 'Исходная потребность', filters, results_total: 0 }],
      shortlist: [],
    }
    ctx.db.searches.push(search)
    return json(searchView(ctx.db, search, ctx.now), 201)
  }),

  route.employer('get', '/searches/:searchId', ({ ctx, params }) => {
    const s = ctx.db.searches.find((x) => x.id === String(params.searchId) && x.companyId === ctx.companyId)
    return s ? json(searchView(ctx.db, s, ctx.now)) : notFound('Подборка')
  }),

  route.employer('patch', '/searches/:searchId', ({ ctx, params, body }) => {
    const s = ctx.db.searches.find((x) => x.id === String(params.searchId) && x.companyId === ctx.companyId)
    if (!s) return notFound('Подборка')
    const parsed = parseBody(RefineSearchBody, body)
    if (!parsed.ok) return parsed.response
    const filters = parsed.data.filters as SearchFilters
    const salaryErr = salaryRangeProblem(filters.salary, '/filters/salary')
    if (salaryErr) return salaryErr
    const skillsErr = validateSkills(filters.must_skills, '/filters/must_skills') ?? validateSkills(filters.nice_skills, '/filters/nice_skills')
    if (skillsErr) return skillsErr
    const prev = s.versions.find((v) => v.version === s.current_version) ?? s.versions[s.versions.length - 1]
    const version = Math.max(...s.versions.map((v) => v.version)) + 1
    const nowIso = ctx.now.toISOString()
    s.versions.push({
      version,
      created_at: nowIso,
      label: parsed.data.label?.trim() || (prev ? filtersDiffLabel(prev.filters, filters) : 'Уточнение'),
      filters,
      results_total: 0,
    })
    s.current_version = version
    s.updated_at = nowIso
    return json(searchView(ctx.db, s, ctx.now))
  }),

  route.employer('get', '/searches/:searchId/results', ({ ctx, params, url }) => {
    const s = ctx.db.searches.find((x) => x.id === String(params.searchId) && x.companyId === ctx.companyId)
    if (!s) return notFound('Подборка')
    const versionParam = url.searchParams.get('version')
    const versionNum = versionParam ? Number(versionParam) : s.current_version
    const version = s.versions.find((v) => v.version === versionNum)
    if (!version) return notFound('Версия подборки')
    const { page, pageSize } = pageParams(url)
    const shortlisted = new Set(s.shortlist.map((e) => e.candidate_id))
    const ranked = rankCandidates(ctx.db, version.filters, ctx.companyId, ctx.now)
    const items: SearchResultItem[] = ranked.map(({ c, ex }, i) => ({
      rank: i + 1,
      candidate: candidateCard(ctx.db, c, ctx.companyId, ctx.now),
      explanation: ex,
      shortlisted: shortlisted.has(c.id),
    }))
    return json({ search_id: s.id, version: version.version, generated_at: ctx.now.toISOString(), ...paginate(items, page, pageSize) })
  }),

  route.employer('put', '/searches/:searchId/shortlist/:candidateId', ({ ctx, params }) => {
    const s = ctx.db.searches.find((x) => x.id === String(params.searchId) && x.companyId === ctx.companyId)
    if (!s) return notFound('Подборка')
    const c = visibleCandidate(ctx.db, String(params.candidateId), ctx.companyId)
    if (!c) return notFound('Кандидат')
    if (!s.shortlist.some((e) => e.candidate_id === c.id)) {
      s.shortlist.push({
        candidate_id: c.id,
        alias: aliasFor(ctx.companyId, c.id),
        category: c.standing ? { specialization: c.standing.specialization, grade: c.standing.grade, label: categoryLabel(c.standing.specialization, c.standing.grade) } : null,
        added_at: ctx.now.toISOString(),
        added_in_version: s.current_version,
      })
      s.updated_at = ctx.now.toISOString()
    }
    return json(searchView(ctx.db, s, ctx.now))
  }),

  route.employer('delete', '/searches/:searchId/shortlist/:candidateId', ({ ctx, params }) => {
    const s = ctx.db.searches.find((x) => x.id === String(params.searchId) && x.companyId === ctx.companyId)
    if (!s) return notFound('Подборка')
    s.shortlist = s.shortlist.filter((e) => e.candidate_id !== String(params.candidateId))
    s.updated_at = ctx.now.toISOString()
    return json(searchView(ctx.db, s, ctx.now))
  }),

  // ───────────── Банк кандидатов ─────────────
  route.employer('get', '/candidates', ({ ctx, url }) => {
    const sp = url.searchParams
    const spec = sp.get('specialization')
    const grades = sp.getAll('grade')
    const skills = sp.getAll('skill')
    const formats = sp.getAll('work_format')
    const city = sp.get('city')
    const fspOnly = sp.get('fsp_only') === 'true'
    const fspLevelMin = sp.get('fsp_level_min')
    const verifiedOnly = sp.get('verified_only') !== 'false'
    const activeDays = sp.get('active_within_days') ? Number(sp.get('active_within_days')) : null
    const sort = sp.get('sort') ?? 'strength'
    const { page, pageSize } = pageParams(url)
    const levelOrder = ['regional', 'national', 'international']
    const list = ctx.db.candidates.filter((c) => {
      const pv = c.consents.find((x) => x.type === 'profile_visibility')
      if (!pv || pv.revoked_at) return false
      if (c.availability === 'not_looking') return false
      if (c.privacy.hiddenCompanyIds.includes(ctx.companyId)) return false
      if (verifiedOnly && !c.standing) return false
      if (!c.standing) return false
      if (spec && c.standing.specialization !== spec) return false
      if (grades.length && !grades.includes(c.standing.grade)) return false
      const ids = new Set(c.skills.map((s) => s.skill_id))
      if (skills.length && !skills.every((s) => ids.has(s))) return false
      if (formats.length && !c.workFormats.some((f) => formats.includes(f))) return false
      if (city && c.city !== city && !(c.relocation || c.workFormats.includes('remote'))) return false
      const hasFsp = c.privacy.showFsp && c.fsp.achievements.length > 0
      if (fspOnly && !hasFsp) return false
      if (fspLevelMin) {
        if (!hasFsp) return false
        const best = Math.max(...c.fsp.achievements.map((a) => levelOrder.indexOf(a.level)))
        if (best < levelOrder.indexOf(fspLevelMin)) return false
      }
      if (activeDays && ctx.now.getTime() - new Date(c.lastActiveAt).getTime() > activeDays * 24 * 3600 * 1000) return false
      return true
    })
    const sorted = [...list].sort((a, b) => {
      if (sort === 'recent') return b.lastActiveAt.localeCompare(a.lastActiveAt)
      if (sort === 'percentile') return (b.standing?.percentile ?? 0) - (a.standing?.percentile ?? 0)
      return strengthParts(b, ctx.now).total - strengthParts(a, ctx.now).total
    })
    const cards = sorted.map((c) => candidateCard(ctx.db, c, ctx.companyId, ctx.now))
    return json(paginate(cards, page, pageSize))
  }),

  route.employer('get', '/candidates/:candidateId', ({ ctx, params, url }) => {
    const c = visibleCandidate(ctx.db, String(params.candidateId), ctx.companyId)
    if (!c) return notFound('Кандидат')
    const searchId = url.searchParams.get('search_id')
    let explanation = null
    if (searchId) {
      const s = ctx.db.searches.find((x) => x.id === searchId && x.companyId === ctx.companyId)
      const v = s?.versions.find((x) => x.version === s.current_version)
      if (v) explanation = explainMatch(c, v.filters, ctx.now)
    }
    return json(candidateDetail(ctx.db, c, ctx.companyId, ctx.now, explanation))
  }),
]

