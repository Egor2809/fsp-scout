import {
  ApplyToVacancyBody,
  CreateCompanyTaskBody,
  CreateVacancyBody,
  EvalRankBody,
  ScoreTaskSubmissionBody,
  SubmitTaskBody,
  UpdateApplicationStatusBody,
  UpdateVacancyBody,
} from '@/api/generated/zod/scout.zod'
import type { ApplicationStatus, EvalRankResponse, Specialization, TestBlueprint, VacancyInput } from '@/api/generated/model'
import { COMPETENCIES, SKILL_BY_ID, skillRef } from '../data/taxonomy'
import { practiceFor } from '../data/items'
import type { MockDb, VacancyRec } from '../db/types'
import { DEMO_ADAPTIVE_MAX, DEMO_ADAPTIVE_MIN } from '../lib/cat'
import { parseNeed } from '../lib/needParser'
import {
  applicationView,
  assignmentView,
  employerApplicationView,
  employerSubmissionView,
  submissionView,
  taskView,
  vacancyView,
} from '../lib/views'
import { json, notFound, pageParams, paginate, parseBody, problem, route, salaryRangeProblem, validationProblem } from '../http'

const APPLICATION_FLOW: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['viewed', 'interview', 'rejected'],
  viewed: ['interview', 'rejected'],
  interview: ['offer', 'rejected'],
  offer: ['hired', 'rejected'],
  hired: [],
  rejected: [],
  withdrawn: [],
}

function validateVacancyInput(d: VacancyInput) {
  const salaryErr = salaryRangeProblem(d.salary)
  if (salaryErr) return salaryErr
  const all = [...d.must_skills.map((id, i) => ({ id, p: `/must_skills/${i}` })), ...d.nice_skills.map((id, i) => ({ id, p: `/nice_skills/${i}` }))]
  const bad = all.find((x) => !SKILL_BY_ID.has(x.id))
  if (bad) return validationProblem([{ pointer: bad.p, detail: 'Навык не найден в справочнике' }])
  return null
}

/** Бланк теста под вакансию: веса навыков → доли компетенций (SOLUTION.md, 4.3). */
export function blueprintFor(v: VacancyRec, now: Date): TestBlueprint {
  const extracted = [
    ...v.mustSkills.map((id, i) => ({ id, weight: 1 - i * 0.08, importance: 'must' as const })),
    ...v.niceSkills.map((id, i) => ({ id, weight: 0.45 - i * 0.05, importance: 'nice' as const })),
  ]
  const totalW = extracted.reduce((s, x) => s + x.weight, 0) || 1
  const comps = new Map<string, { weight: number; skills: string[] }>()
  for (const x of extracted) {
    const comp = SKILL_BY_ID.get(x.id)?.competency_id ?? `${v.specialization}.other`
    const cur = comps.get(comp) ?? { weight: 0, skills: [] }
    cur.weight += x.weight
    cur.skills.push(x.id)
    comps.set(comp, cur)
  }
  // Архитектурный блок для Middle+ — обязательная доля
  const archId = v.specialization === 'backend' ? 'backend.architecture' : null
  if (archId && v.grade !== 'junior' && !comps.has(archId)) comps.set(archId, { weight: totalW * 0.25, skills: ['system_design'] })
  const sum = [...comps.values()].reduce((s, c) => s + c.weight, 0) || 1
  const names = new Map(Object.values(COMPETENCIES).flat().map((c) => [c.id, c.name]))
  let shares = [...comps.entries()].map(([id, c]) => ({
    competency_id: id,
    name: names.get(id) ?? id,
    share: Math.round((c.weight / sum) * 100) / 100,
    families_count: 3 + Math.round((c.weight / sum) * 12),
    skills: c.skills.map(skillRef),
  }))
  // Добиваем округление до суммы 1
  const diff = Math.round((1 - shares.reduce((s, x) => s + x.share, 0)) * 100) / 100
  if (shares[0]) shares[0].share = Math.round((shares[0].share + diff) * 100) / 100
  shares = shares.sort((a, b) => b.share - a.share)
  const practice = practiceFor(v.specialization)
  return {
    vacancy_id: v.id,
    vacancy_title: v.title,
    specialization: v.specialization,
    grade: v.grade,
    extracted_skills: extracted.map((x) => ({ skill: skillRef(x.id), weight: Math.round((x.weight / totalW) * 100) / 100, importance: x.importance })),
    competencies: shares,
    adaptive_items: { min: DEMO_ADAPTIVE_MIN, max: DEMO_ADAPTIVE_MAX },
    practice: practice && practice.language ? { title: practice.title, language: practice.language } : null,
    generated_at: now.toISOString(),
  }
}

function ownVacancy(db: MockDb, id: unknown, companyId: string) {
  return db.vacancies.find((v) => v.id === String(id) && v.companyId === companyId)
}

export const vacancyHandlers = [
  route.roles(['candidate', 'employer'], 'get', '/vacancies', ({ ctx, url }) => {
    const sp = url.searchParams
    const spec = sp.get('specialization')
    const grade = sp.get('grade')
    const format = sp.get('work_format')
    const q = (sp.get('q') ?? '').trim().toLowerCase()
    const { page, pageSize } = pageParams(url)
    const candidate = ctx.user.role === 'candidate' ? ctx.db.candidates.find((c) => c.id === ctx.user.candidateId) : undefined
    const list = ctx.db.vacancies
      .filter((v) => v.status === 'published')
      .filter((v) => !spec || v.specialization === spec)
      .filter((v) => !grade || v.grade === grade)
      .filter((v) => !format || v.workFormat === format)
      .filter((v) => {
        if (!q) return true
        const company = ctx.db.companies.find((c) => c.id === v.companyId)
        return `${v.title} ${v.description} ${company?.name ?? ''}`.toLowerCase().includes(q)
      })
      .map((v) =>
        candidate
          ? vacancyView(ctx.db, v, { role: 'candidate', candidate }, ctx.now)
          : vacancyView(ctx.db, v, { role: 'employer', companyId: ctx.user.companyId ?? '' }, ctx.now),
      )
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0) || (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    return json(paginate(list, page, pageSize))
  }),

  route.employer('post', '/vacancies', ({ ctx, body }) => {
    const parsed = parseBody(CreateVacancyBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data as VacancyInput
    const err = validateVacancyInput(d)
    if (err) return err
    const nowIso = ctx.now.toISOString()
    const v: VacancyRec = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      title: d.title.trim(),
      description: d.description.trim(),
      specialization: d.specialization,
      grade: d.grade,
      mustSkills: [...new Set(d.must_skills)],
      niceSkills: [...new Set(d.nice_skills)].filter((id) => !d.must_skills.includes(id)),
      workFormat: d.work_format,
      city: d.city ?? null,
      salary: d.salary,
      status: d.status,
      publishedAt: d.status === 'published' ? nowIso : null,
      createdAt: nowIso,
    }
    ctx.db.vacancies.push(v)
    return json(vacancyView(ctx.db, v, { role: 'employer', companyId: ctx.companyId }, ctx.now), 201)
  }),

  route.roles(['candidate', 'employer'], 'get', '/vacancies/:vacancyId', ({ ctx, params }) => {
    const v = ctx.db.vacancies.find((x) => x.id === String(params.vacancyId))
    if (!v) return notFound('Вакансия')
    if (ctx.user.role === 'candidate') {
      const candidate = ctx.db.candidates.find((c) => c.id === ctx.user.candidateId)
      if (!candidate || (v.status === 'draft')) return notFound('Вакансия')
      return json(vacancyView(ctx.db, v, { role: 'candidate', candidate }, ctx.now))
    }
    if (v.status === 'draft' && v.companyId !== ctx.user.companyId) return notFound('Вакансия')
    return json(vacancyView(ctx.db, v, { role: 'employer', companyId: ctx.user.companyId ?? '' }, ctx.now))
  }),

  route.employer('put', '/vacancies/:vacancyId', ({ ctx, params, body }) => {
    const v = ownVacancy(ctx.db, params.vacancyId, ctx.companyId)
    if (!v) return notFound('Вакансия')
    const parsed = parseBody(UpdateVacancyBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data as VacancyInput
    const err = validateVacancyInput(d)
    if (err) return err
    Object.assign(v, {
      title: d.title.trim(),
      description: d.description.trim(),
      specialization: d.specialization,
      grade: d.grade,
      mustSkills: [...new Set(d.must_skills)],
      niceSkills: [...new Set(d.nice_skills)].filter((id) => !d.must_skills.includes(id)),
      workFormat: d.work_format,
      city: d.city ?? null,
      salary: d.salary,
      status: d.status,
      publishedAt: d.status === 'published' ? (v.publishedAt ?? ctx.now.toISOString()) : v.publishedAt,
    })
    return json(vacancyView(ctx.db, v, { role: 'employer', companyId: ctx.companyId }, ctx.now))
  }),

  route.employer('get', '/company/vacancies', ({ ctx }) =>
    json(
      ctx.db.vacancies
        .filter((v) => v.companyId === ctx.companyId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((v) => vacancyView(ctx.db, v, { role: 'employer', companyId: ctx.companyId }, ctx.now)),
    ),
  ),

  route.candidate('post', '/vacancies/:vacancyId/apply', ({ ctx, params, body }) => {
    const v = ctx.db.vacancies.find((x) => x.id === String(params.vacancyId))
    if (!v || v.status === 'draft') return notFound('Вакансия')
    if (v.status === 'closed') return problem(409, 'vacancy_closed', 'Вакансия закрыта', 'Компания больше не принимает отклики.')
    const parsed = parseBody(ApplyToVacancyBody, body ?? {})
    if (!parsed.ok) return parsed.response
    const c = ctx.candidate
    const existing = ctx.db.applications.find((a) => a.vacancyId === v.id && a.candidateId === c.id && a.status !== 'withdrawn')
    if (existing) return problem(409, 'already_applied', 'Отклик уже отправлен', 'Вы уже откликнулись на эту вакансию.')
    const at = ctx.now.toISOString()
    const app = {
      id: crypto.randomUUID(),
      vacancyId: v.id,
      candidateId: c.id,
      status: 'submitted' as const,
      coverLetter: parsed.data.cover_letter?.trim() || null,
      createdAt: at,
      updatedAt: at,
      events: [{ at, status: 'submitted' as const, actor: 'candidate' as const, note: null }],
    }
    ctx.db.applications.push(app)
    // Отклик раскрывает контакты этой компании — запись в журнал
    if (!ctx.db.reveals.some((r) => r.companyId === v.companyId && r.candidateId === c.id)) {
      ctx.db.reveals.push({ companyId: v.companyId, candidateId: c.id, reason: 'application', sourceId: app.id, at })
    }
    return json(applicationView(ctx.db, app), 201)
  }),

  route.employer('get', '/vacancies/:vacancyId/applications', ({ ctx, params }) => {
    const v = ownVacancy(ctx.db, params.vacancyId, ctx.companyId)
    if (!v) return notFound('Вакансия')
    const list = ctx.db.applications
      .filter((a) => a.vacancyId === v.id && a.status !== 'withdrawn')
      .map((a) => employerApplicationView(ctx.db, a, ctx.now))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => b.explanation.score - a.explanation.score)
    return json(list)
  }),

  route.roles(['candidate', 'employer'], 'get', '/vacancies/:vacancyId/test-blueprint', ({ ctx, params }) => {
    const v = ctx.db.vacancies.find((x) => x.id === String(params.vacancyId))
    if (!v || (v.status === 'draft' && v.companyId !== ctx.user.companyId)) return notFound('Вакансия')
    return json(blueprintFor(v, ctx.now))
  }),

  route.candidate('get', '/me/applications', ({ ctx }) =>
    json(
      ctx.db.applications
        .filter((a) => a.candidateId === ctx.candidate.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((a) => applicationView(ctx.db, a)),
    ),
  ),

  route.candidate('post', '/applications/:applicationId/withdraw', ({ ctx, params }) => {
    const app = ctx.db.applications.find((a) => a.id === String(params.applicationId) && a.candidateId === ctx.candidate.id)
    if (!app) return notFound('Отклик')
    if (['hired', 'rejected', 'withdrawn'].includes(app.status)) return problem(409, 'conflict', 'Нельзя отозвать', 'Отклик уже закрыт.')
    const at = ctx.now.toISOString()
    app.status = 'withdrawn'
    app.updatedAt = at
    app.events.push({ at, status: 'withdrawn', actor: 'candidate', note: null })
    return json(applicationView(ctx.db, app))
  }),

  route.employer('post', '/applications/:applicationId/status', ({ ctx, params, body }) => {
    const app = ctx.db.applications.find((a) => a.id === String(params.applicationId))
    const v = app ? ownVacancy(ctx.db, app.vacancyId, ctx.companyId) : undefined
    if (!app || !v) return notFound('Отклик')
    const parsed = parseBody(UpdateApplicationStatusBody, body)
    if (!parsed.ok) return parsed.response
    const next = parsed.data.status as ApplicationStatus
    if (!APPLICATION_FLOW[app.status].includes(next)) return problem(409, 'conflict', 'Переход недоступен', `Нельзя перевести отклик из «${app.status}» в «${next}».`)
    const at = ctx.now.toISOString()
    app.status = next
    app.updatedAt = at
    app.events.push({ at, status: next, actor: 'employer', note: parsed.data.note ?? null })
    const view = employerApplicationView(ctx.db, app, ctx.now)
    return view ? json(view) : notFound('Отклик')
  }),

  // ───────────── Регулярные задания ─────────────
  route.candidate('get', '/me/tasks', ({ ctx }) =>
    json(
      ctx.db.assignments
        .filter((a) => a.candidateId === ctx.candidate.id)
        .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))
        .map((a) => assignmentView(ctx.db, ctx.candidate.id, a.taskId))
        .filter((x) => x !== null),
    ),
  ),

  route.candidate('get', '/me/tasks/:taskId', ({ ctx, params }) => {
    const view = assignmentView(ctx.db, ctx.candidate.id, String(params.taskId))
    return view ? json(view) : notFound('Задание')
  }),

  route.candidate('post', '/tasks/:taskId/submissions', ({ ctx, params, body }) => {
    const a = ctx.db.assignments.find((x) => x.taskId === String(params.taskId) && x.candidateId === ctx.candidate.id)
    const t = ctx.db.tasks.find((x) => x.id === String(params.taskId))
    if (!a || !t) return notFound('Задание')
    if (a.status !== 'assigned') return problem(409, 'task_already_submitted', 'Решение уже отправлено', 'Задание можно сдать один раз.')
    if (new Date(a.dueAt).getTime() < ctx.now.getTime()) return problem(409, 'conflict', 'Срок истёк', 'Срок сдачи задания прошёл.')
    const parsed = parseBody(SubmitTaskBody, body)
    if (!parsed.ok) return parsed.response
    const text = parsed.data.answer_text?.trim() || null
    const code = parsed.data.code?.trim() || null
    if (!text && !code) return validationProblem([{ pointer: '/answer_text', detail: 'Добавьте решение: код или текст' }])
    // Предварительная оценка по рубрике (в проде — LLM, последнее слово за работодателем)
    const size = (text?.length ?? 0) + (code?.length ?? 0)
    const llm = Math.max(35, Math.min(92, Math.round(45 + Math.log2(1 + size) * 4.5)))
    const sub = {
      id: crypto.randomUUID(),
      taskId: t.id,
      candidateId: ctx.candidate.id,
      submittedAt: ctx.now.toISOString(),
      answerText: text,
      code,
      language: parsed.data.language ?? t.language,
      status: 'pending' as const,
      llmScore: llm,
      finalScore: null,
      freshSignal: false,
      feedback: null,
    }
    ctx.db.submissions.push(sub)
    a.status = 'submitted'
    return json(submissionView(sub), 201)
  }),

  route.employer('get', '/regular-tasks', ({ ctx }) =>
    json(
      ctx.db.tasks
        .filter((t) => t.companyId === ctx.companyId)
        .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
        .map((t) => taskView(ctx.db, t, true)),
    ),
  ),

  route.employer('post', '/regular-tasks', ({ ctx, body }) => {
    const parsed = parseBody(CreateCompanyTaskBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const weights = d.rubric.reduce((s, r) => s + r.weight, 0)
    if (Math.abs(weights - 1) > 0.01) return validationProblem([{ pointer: '/rubric', detail: 'Сумма весов критериев должна быть равна 1' }])
    if (new Date(d.deadline_at).getTime() <= ctx.now.getTime()) return validationProblem([{ pointer: '/deadline_at', detail: 'Срок должен быть в будущем' }])
    const nowIso = ctx.now.toISOString()
    const t = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      title: d.title.trim(),
      description: d.description.trim(),
      kind: d.kind,
      specializations: d.specializations as Specialization[],
      grades: d.grades,
      timeLimitMin: d.time_limit_min,
      language: d.language ?? null,
      starterCode: d.starter_code ?? null,
      rubric: d.rubric,
      status: 'active' as const,
      publishedAt: nowIso,
      deadlineAt: d.deadline_at,
    }
    ctx.db.tasks.push(t)
    // Раздача подходящим кандидатам: не чаще одного задания в 2 недели на человека
    const twoWeeks = 14 * 24 * 3600 * 1000
    const eligible = ctx.db.candidates
      .filter((c) => c.standing && t.specializations.includes(c.standing.specialization) && t.grades.includes(c.standing.grade) && c.availability !== 'not_looking')
      .filter((c) => !ctx.db.assignments.some((a) => a.candidateId === c.id && ctx.now.getTime() - new Date(a.assignedAt).getTime() < twoWeeks))
      .slice(0, 25)
    for (const c of eligible) {
      ctx.db.assignments.push({ taskId: t.id, candidateId: c.id, status: 'assigned', assignedAt: nowIso, dueAt: t.deadlineAt })
    }
    return json(taskView(ctx.db, t, true), 201)
  }),

  route.employer('get', '/regular-tasks/:taskId', ({ ctx, params }) => {
    const t = ctx.db.tasks.find((x) => x.id === String(params.taskId) && x.companyId === ctx.companyId)
    return t ? json(taskView(ctx.db, t, true)) : notFound('Задание')
  }),

  route.employer('get', '/regular-tasks/:taskId/submissions', ({ ctx, params }) => {
    const t = ctx.db.tasks.find((x) => x.id === String(params.taskId) && x.companyId === ctx.companyId)
    if (!t) return notFound('Задание')
    const list = ctx.db.submissions
      .filter((s) => s.taskId === t.id)
      .map((s) => employerSubmissionView(ctx.db, s, ctx.companyId, ctx.now))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => (b.final_score ?? b.llm_score ?? 0) - (a.final_score ?? a.llm_score ?? 0))
    return json(list)
  }),

  route.employer('post', '/regular-tasks/:taskId/submissions/:submissionId/score', ({ ctx, params, body }) => {
    const t = ctx.db.tasks.find((x) => x.id === String(params.taskId) && x.companyId === ctx.companyId)
    const s = t ? ctx.db.submissions.find((x) => x.id === String(params.submissionId) && x.taskId === t.id) : undefined
    if (!t || !s) return notFound('Решение')
    const parsed = parseBody(ScoreTaskSubmissionBody, body)
    if (!parsed.ok) return parsed.response
    s.finalScore = parsed.data.final_score
    s.feedback = parsed.data.feedback ?? null
    s.status = 'scored'
    s.freshSignal = s.finalScore >= 75
    const a = ctx.db.assignments.find((x) => x.taskId === t.id && x.candidateId === s.candidateId)
    if (a) a.status = 'reviewed'
    const c = ctx.db.candidates.find((x) => x.id === s.candidateId)
    if (c && s.freshSignal) {
      c.taskSignal = { fresh: true, solvedCount: c.taskSignal.solvedCount + 1, lastSolvedAt: ctx.now.toISOString() }
    }
    const view = employerSubmissionView(ctx.db, s, ctx.companyId, ctx.now)
    return view ? json(view) : notFound('Решение')
  }),

  // ───────────── Сервисные ─────────────
  route.roles(['admin', 'employer'], 'post', '/eval/rank', ({ body }) => {
    const parsed = parseBody(EvalRankBody, body)
    if (!parsed.ok) return parsed.response
    const topK = parsed.data.top_k ?? 10
    const response: EvalRankResponse = {
      results: parsed.data.vacancies.map((v) => {
        const need = parseNeed(v.text)
        const wanted = new Set([...need.must_skills, ...need.nice_skills].map((s) => s.id))
        const ranking = parsed.data.candidates
          .map((c) => {
            const cand = parseNeed(c.text)
            const have = new Set([...cand.must_skills, ...cand.nice_skills].map((s) => s.id))
            const overlap = [...wanted].filter((id) => have.has(id))
            const score = wanted.size ? Math.round((overlap.length / wanted.size) * 1000) / 10 : 0
            return {
              candidate_id: c.id,
              score,
              factors: [{ kind: 'skills_coverage' as const, label: overlap.length ? `Совпадают навыки: ${overlap.join(', ')}` : 'Нет совпадений по навыкам', contribution: score, polarity: overlap.length ? ('positive' as const) : ('negative' as const), evidence: `${overlap.length} из ${wanted.size}` }],
            }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, topK)
        return { vacancy_id: v.id, ranking }
      }),
    }
    return json(response)
  }),

  route.public('post', '/webhooks/fsp', ({ request }) => {
    if (!request.headers.get('X-FSP-Signature')) return problem(401, 'unauthorized', 'Нет подписи', 'Заголовок X-FSP-Signature обязателен.')
    return new Response(null, { status: 202 })
  }),
]

