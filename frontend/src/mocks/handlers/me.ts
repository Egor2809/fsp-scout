import { HttpResponse } from 'msw'
import {
  UpdateMyConsentsBody,
  UpdateMyPrivacyBody,
  UpdateMyProfileBody,
} from '@/api/generated/zod/scout.zod'
import type { CandidateProfileUpdate, ConsentState, ResumeParseResult } from '@/api/generated/model'
import { formatDate } from '@/lib/format'
import { categoryLabel } from '@/lib/labels'
import { buildTaxonomy, SKILL_BY_ID, skillName } from '../data/taxonomy'
import { CONSENT_DOCUMENTS } from '../lib/consents'
import { buildPdf } from '../lib/pdf'
import { candidateCard, companyBrief, currentUser, privacyView, profileView } from '../lib/views'
import { json, parseBody, problem, route, salaryRangeProblem, validationProblem } from '../http'
import type { CandidateRec } from '../db/types'

function consentState(c: CandidateRec): ConsentState {
  return { documents: CONSENT_DOCUMENTS, consents: c.consents }
}

export const meHandlers = [
  route.any('get', '/me', ({ ctx }) => json(currentUser(ctx.db, ctx.user))),

  route.roles(['candidate', 'employer'], 'delete', '/me', ({ ctx }) => {
    const { db, user, now } = ctx
    if (user.candidateId) {
      const cand = db.candidates.find((c) => c.id === user.candidateId)
      if (cand) {
        // Профиль сразу скрывается из выдачи; удаление данных — фоновой задачей
        cand.consents = cand.consents.map((c) => (c.type === 'profile_visibility' ? { ...c, revoked_at: now.toISOString() } : c))
        cand.availability = 'not_looking'
      }
    }
    return json({ scheduled_at: new Date(now.getTime() + 24 * 3600 * 1000).toISOString() }, 202)
  }),

  route.roles(['candidate', 'employer'], 'get', '/me/export', ({ ctx }) => {
    const { db, user } = ctx
    const cand = user.candidateId ? db.candidates.find((c) => c.id === user.candidateId) : undefined
    return json({
      exported_at: ctx.now.toISOString(),
      user: { id: user.id, email: user.email, role: user.role, display_name: user.displayName },
      profile: cand ? profileView(cand) : null,
      privacy: cand ? privacyView(db, cand) : null,
      consents: cand?.consents ?? [],
      surveys: cand ? db.surveys.filter((s) => s.candidateId === cand.id) : [],
      tests: cand ? db.tests.filter((t) => t.candidateId === cand.id).map((t) => ({ id: t.id, grade: t.declaredGrade, status: t.status, result: t.result })) : [],
      invitations: cand ? db.invitations.filter((i) => i.candidateId === cand.id).map((i) => ({ id: i.id, status: i.status, title: i.title })) : [],
      disclosures: cand ? db.reveals.filter((r) => r.candidateId === cand.id) : [],
    })
  }),

  route.candidate('get', '/me/consents', ({ ctx }) => json(consentState(ctx.candidate))),

  route.candidate('post', '/me/consents', ({ ctx, body }) => {
    const parsed = parseBody(UpdateMyConsentsBody, body)
    if (!parsed.ok) return parsed.response
    const { candidate, now } = ctx
    const errors = parsed.data.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.type === 'personal_data' && !item.given)
      .map(({ index }) => ({ pointer: `/items/${index}/given`, detail: 'Согласие на обработку ПДн отзывается удалением аккаунта' }))
    const unknownVersion = parsed.data.items.findIndex((item) => !CONSENT_DOCUMENTS.some((d) => d.type === item.type && d.version === item.version))
    if (unknownVersion >= 0) errors.push({ pointer: `/items/${unknownVersion}/version`, detail: 'Устаревшая версия документа, обновите страницу' })
    if (errors.length) return validationProblem(errors)
    for (const item of parsed.data.items) {
      const existing = candidate.consents.find((c) => c.type === item.type)
      if (item.given) {
        if (!existing || existing.revoked_at || existing.version !== item.version) {
          candidate.consents = candidate.consents.filter((c) => c.type !== item.type)
          candidate.consents.push({ type: item.type, version: item.version, given_at: now.toISOString(), revoked_at: null })
        }
      } else if (existing && !existing.revoked_at) {
        existing.revoked_at = now.toISOString()
        if (item.type === 'fsp_data') {
          candidate.fsp = { linked: false, fspId: null, verifiedAt: null, achievements: [] }
        }
      }
    }
    return json(consentState(candidate))
  }),

  route.public('get', '/taxonomy', () =>
    HttpResponse.json(buildTaxonomy(), { headers: { 'Cache-Control': 'public, max-age=3600' } }),
  ),

  route.candidate('get', '/companies', ({ ctx, url }) => {
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
    const list = ctx.db.companies
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      .slice(0, 20)
      .map(companyBrief)
    return json(list)
  }),

  route.candidate('get', '/me/profile', ({ ctx }) => json(profileView(ctx.candidate))),

  route.candidate('put', '/me/profile', ({ ctx, body }) => {
    const parsed = parseBody(UpdateMyProfileBody, body)
    if (!parsed.ok) return parsed.response
    const data = parsed.data as CandidateProfileUpdate
    const salaryErr = salaryRangeProblem(data.salary_expectation, '/salary_expectation')
    if (salaryErr) return salaryErr
    const unknownSkill = data.skills.findIndex((s) => !SKILL_BY_ID.has(s.skill_id))
    if (unknownSkill >= 0) return validationProblem([{ pointer: `/skills/${unknownSkill}/skill_id`, detail: 'Навык не найден в справочнике' }])
    const c = ctx.candidate
    c.fullName = data.full_name.trim()
    c.phone = data.phone ?? null
    c.telegram = data.telegram ?? null
    c.city = data.city ?? null
    c.relocation = data.relocation
    c.about = data.about ?? null
    c.experienceYears = data.experience_years
    c.experience = data.experience.map((e) => ({
      role: e.role,
      companyName: e.company_name ?? null,
      industry: e.industry ?? null,
      start: e.start,
      end: e.end ?? null,
      description: e.description ?? null,
    }))
    // Подтверждённые навыки (test/fsp/task) сохраняет только сервер
    const verified = c.skills.filter((s) => s.source === 'test' || s.source === 'fsp' || s.source === 'task')
    const declared = data.skills
      .filter((s) => !verified.some((v) => v.skill_id === s.skill_id))
      .map((s) => ({ skill_id: s.skill_id, name: skillName(s.skill_id), level: s.level, source: s.source, verified: false, score: null }))
    c.skills = [...verified, ...declared]
    c.industries = data.industries
    c.workFormats = data.work_formats
    c.salaryExpectation = data.salary_expectation
    if (c.preferredChannel === 'telegram' && !c.telegram) c.preferredChannel = 'email'
    if (c.preferredChannel === 'phone' && !c.phone) c.preferredChannel = 'email'
    c.updatedAt = ctx.now.toISOString()
    return json(profileView(c))
  }),

  route.candidate('post', '/me/resume', ({ ctx, form }) => {
    const file = form?.get('file')
    if (!(file instanceof File)) return validationProblem([{ pointer: '/file', detail: 'Прикрепите PDF-файл' }])
    if (file.size > 5 * 1024 * 1024) return problem(413, 'file_too_large', 'Файл слишком большой', 'Максимальный размер резюме — 5 МБ.')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return problem(415, 'unsupported_media_type', 'Нужен PDF', 'Загрузите резюме в формате PDF.')
    const c = ctx.candidate
    // Мок распознавания: правдоподобные поля на основе профиля и типичного резюме бэкенд-разработчика
    const result: ResumeParseResult = {
      resume_id: crypto.randomUUID(),
      file_name: file.name,
      uploaded_at: ctx.now.toISOString(),
      fields: {
        full_name: c.fullName,
        email: c.email,
        phone: c.phone ?? '+7 917 245-18-63',
        telegram: c.telegram ?? '@scout_candidate',
        city: c.city ?? 'Казань',
        experience_years: c.experienceYears > 0 ? c.experienceYears : 3.5,
        roles: ['Backend-разработчик', 'Python-разработчик'],
        skills: [
          { raw: 'Golang', skill_id: 'go', name: 'Go' },
          { raw: 'постгрес', skill_id: 'postgresql', name: 'PostgreSQL' },
          { raw: 'Kafka', skill_id: 'kafka', name: 'Kafka' },
          { raw: 'k8s', skill_id: 'kubernetes', name: 'Kubernetes' },
          { raw: 'Docker', skill_id: 'docker', name: 'Docker' },
          { raw: 'FastAPI', skill_id: 'fastapi', name: 'FastAPI' },
          { raw: 'Clean Architecture', skill_id: null, name: 'Clean Architecture' },
        ],
        soft_skills: ['Code review', 'Наставничество'],
        experience: [
          { role: 'Go-разработчик', company_name: 'ООО «Платёжные решения»', company_hidden: false, industry: 'fintech', start: '2023-02', end: null, description: 'Сервис выплат: Go, PostgreSQL, Kafka.' },
          { role: 'Python-разработчик', company_name: 'ООО «РитейлСофт»', company_hidden: false, industry: 'ecom', start: '2021-09', end: '2023-01', description: 'Программа лояльности на FastAPI.' },
        ],
        about: 'Backend-разработчик: платёжные сервисы, интеграции, высоконагруженные API.',
      },
      confidence: { full_name: 0.98, email: 0.99, phone: 0.93, telegram: 0.71, city: 0.86, experience_years: 0.64, roles: 0.82, skills: 0.8, soft_skills: 0.55, experience: 0.77, about: 0.6 },
      warnings: ['Стаж посчитан по датам в резюме — проверьте', 'Навык «Clean Architecture» не найден в справочнике'],
    }
    return json(result)
  }),

  route.candidate('get', '/me/profile.pdf', ({ ctx }) => {
    const c = ctx.candidate
    if (!c.standing) return problem(409, 'grade_unconfirmed', 'Грейд не подтверждён', 'PDF-профиль формируется после прохождения теста.')
    const verified = c.skills.filter((s) => s.verified).map((s) => s.name).join(', ')
    const pdf = buildPdf([
      { text: 'Скаут x ФСП — верифицированный профиль', size: 18, gap: 40 },
      { text: c.fullName, size: 14 },
      { text: `Категория: ${categoryLabel(c.standing.specialization, c.standing.grade)}, ${c.standing.percentile}-й перцентиль` },
      { text: `Грейд подтверждён: ${formatDate(c.standing.confirmedAt)}` },
      { text: `Подтверждённые навыки: ${verified || '—'}` },
      { text: `Достижения ФСП: ${c.fsp.achievements.length || 'нет истории ФСП'}` },
      { text: `Проверка подлинности: /verify/${c.id.replace(/-/g, '')}`, gap: 32 },
    ])
    return new HttpResponse(pdf, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="scout-profile.pdf"' },
    })
  }),

  route.candidate('get', '/me/card-preview', ({ ctx }) => json(candidateCard(ctx.db, ctx.candidate, null, ctx.now))),

  route.candidate('get', '/me/privacy', ({ ctx }) => json(privacyView(ctx.db, ctx.candidate))),

  route.candidate('put', '/me/privacy', ({ ctx, body }) => {
    const parsed = parseBody(UpdateMyPrivacyBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const unknown = d.hidden_company_ids.findIndex((id) => !ctx.db.companies.some((co) => co.id === id))
    if (unknown >= 0) return validationProblem([{ pointer: `/hidden_company_ids/${unknown}`, detail: 'Компания не найдена' }])
    const c = ctx.candidate
    c.availability = d.availability
    c.privacy = {
      salaryFloor: d.salary_floor ?? null,
      hiddenCompanyIds: [...new Set(d.hidden_company_ids)],
      showFsp: d.show_fsp,
      showCompanyNames: d.show_company_names,
      showCity: d.show_city,
    }
    c.updatedAt = ctx.now.toISOString()
    return json(privacyView(ctx.db, c))
  }),

  route.public('get', '/verify/:token', ({ ctx, params }) => {
    const token = String(params.token ?? '')
    const c = ctx.db.candidates.find((x) => x.id.replace(/-/g, '') === token)
    if (!c || !c.standing) return problem(404, 'not_found', 'Профиль не найден', 'Ссылка проверки недействительна.')
    return json({
      valid: true,
      full_name: c.fullName,
      category: { specialization: c.standing.specialization, grade: c.standing.grade, label: categoryLabel(c.standing.specialization, c.standing.grade) },
      percentile: c.standing.percentile,
      confirmed_at: c.standing.confirmedAt,
      fsp_achievements_count: c.fsp.achievements.length,
      issued_at: ctx.now.toISOString(),
    })
  }),
]

