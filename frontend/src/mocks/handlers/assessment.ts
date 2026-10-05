import { CreateSurveyBody, RunTestCodeBody, StartTestBody, SubmitTestAnswerBody } from '@/api/generated/zod/scout.zod'
import type { CodeRunResult, Grade, Specialization, Survey, TestSession, TestSessionSummary } from '@/api/generated/model'
import { computeEligibility } from '@/lib/retake'
import { SKILL_BY_ID, skillName } from '../data/taxonomy'
import { buildFamily, FAMILIES } from '../data/families'
import { PRACTICE_ITEMS } from '../data/items'
import type { CandidateRec, MockDb, TestRec } from '../db/types'
import { finishTest, judgePractice, nextStep, progressOf, startTest, submitAnswer } from '../lib/cat'
import { json, notFound, parseBody, problem, route, salaryRangeProblem, validationProblem } from '../http'

function lastSurvey(db: MockDb, candidateId: string) {
  return db.surveys.filter((s) => s.candidateId === candidateId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
}

export function eligibilityFor(db: MockDb, c: CandidateRec, specialization: Specialization | null, now: Date) {
  const spec = specialization ?? lastSurvey(db, c.id)?.specialization ?? c.specialization
  const survey = lastSurvey(db, c.id)
  const attempts = db.tests
    .filter((t) => t.candidateId === c.id && t.specialization === spec && t.result && t.finishedAt)
    .map((t) => ({ grade: t.declaredGrade, outcome: t.result!.outcome, finishedAt: new Date(t.finishedAt!) }))
  const active = db.tests.find((t) => t.candidateId === c.id && t.status === 'in_progress') ?? null
  const sameSpec = c.standing && c.standing.specialization === spec
  const result = computeEligibility(
    {
      currentGrade: sameSpec ? c.standing!.grade : null,
      lastGradeChangeAt: sameSpec && c.gradeChangedAt ? new Date(c.gradeChangedAt) : null,
      attempts,
      hasActiveTest: Boolean(active),
      experienceYears: survey?.experience_years ?? (c.experienceYears || null),
    },
    now,
  )
  const grades = survey
    ? result.grades
    : result.grades.map((g) => ({ ...g, can_start: false, reason: 'survey_required' as const, available_at: null }))
  return {
    specialization: spec,
    current_grade: sameSpec ? c.standing!.grade : null,
    last_grade_change_at: sameSpec ? c.gradeChangedAt : null,
    next_grade_change_at: result.nextGradeChangeAt ? result.nextGradeChangeAt.toISOString() : null,
    active_test_id: active?.id ?? null,
    grades,
  }
}

function sessionView(t: TestRec): TestSession {
  return {
    id: t.id,
    specialization: t.specialization,
    declared_grade: t.declaredGrade,
    status: t.status,
    started_at: t.startedAt,
    deadline_at: t.deadlineAt,
    finished_at: t.finishedAt,
    time_limit_sec: t.timeLimitSec,
    progress: progressOf(t),
    vacancy_id: t.vacancyId,
  }
}

function ownTest(db: MockDb, c: CandidateRec, id: unknown): TestRec | undefined {
  return db.tests.find((t) => t.id === String(id) && t.candidateId === c.id)
}

export const assessmentHandlers = [
  route.candidate('post', '/surveys', ({ ctx, body }) => {
    const { candidate: c, db, now } = ctx
    const pd = c.consents.find((x) => x.type === 'personal_data')
    if (!pd || pd.revoked_at) {
      return problem(403, 'consent_required', 'Нужно согласие', 'Сначала дайте согласие на обработку персональных данных.', { consent_types: ['personal_data'] })
    }
    const parsed = parseBody(CreateSurveyBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const salaryErr = salaryRangeProblem(d.salary_expectation, '/salary_expectation')
    if (salaryErr) return salaryErr
    const unknown = d.primary_stack.findIndex((id) => !SKILL_BY_ID.has(id))
    if (unknown >= 0) return validationProblem([{ pointer: `/primary_stack/${unknown}`, detail: 'Навык не найден в справочнике' }])
    const survey: Survey = {
      id: crypto.randomUUID(),
      created_at: now.toISOString(),
      industries: d.industries,
      specialization: d.specialization,
      primary_stack: [...new Set(d.primary_stack)],
      experience_years: d.experience_years,
      work_formats: d.work_formats,
      city: d.city ?? null,
      relocation: d.relocation,
      salary_expectation: d.salary_expectation,
    }
    db.surveys.push({ ...survey, candidateId: c.id })
    // Опрос обновляет профиль: специализация, стек (как заявленный), формат, город, ожидания
    c.specialization = d.specialization
    c.industries = d.industries
    c.workFormats = d.work_formats
    c.city = d.city ?? c.city
    c.relocation = d.relocation
    c.experienceYears = d.experience_years
    c.salaryExpectation = d.salary_expectation
    for (const id of survey.primary_stack) {
      if (!c.skills.some((s) => s.skill_id === id)) {
        c.skills.push({ skill_id: id, name: skillName(id), level: 'confident', source: 'self', verified: false, score: null })
      }
    }
    c.updatedAt = now.toISOString()
    return json(survey, 201)
  }),

  route.candidate('get', '/me/surveys', ({ ctx }) =>
    json(
      ctx.db.surveys
        .filter((s) => s.candidateId === ctx.candidate.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(({ candidateId: _omit, ...s }) => s),
    ),
  ),

  route.candidate('get', '/me/test-eligibility', ({ ctx, url }) => {
    const spec = url.searchParams.get('specialization') as Specialization | null
    return json(eligibilityFor(ctx.db, ctx.candidate, spec, ctx.now))
  }),

  route.candidate('post', '/tests', ({ ctx, body }) => {
    const { db, candidate: c, now } = ctx
    const parsed = parseBody(StartTestBody, body)
    if (!parsed.ok) return parsed.response
    const survey = lastSurvey(db, c.id)
    if (!survey) return problem(409, 'survey_required', 'Сначала опрос', 'Перед тестом нужно пройти опрос.')
    const spec = (parsed.data.specialization ?? survey.specialization) as Specialization
    const grade = parsed.data.declared_grade as Grade
    const elig = eligibilityFor(db, c, spec, now)
    if (elig.active_test_id) return problem(409, 'test_in_progress', 'Тест уже идёт', 'Завершите начатый тест.')
    const g = elig.grades.find((x) => x.grade === grade)
    if (!g?.can_start) {
      return problem(409, 'retake_locked', 'Попытка пока недоступна', g?.reason === 'grade_change_cooldown' ? 'Подтверждённый грейд меняется не чаще одного раза в 90 дней.' : 'Этот грейд можно пересдать через 30 дней.', g?.available_at ? { available_at: g.available_at } : {})
    }
    const vacancyId = parsed.data.vacancy_id ?? null
    if (vacancyId && !db.vacancies.some((v) => v.id === vacancyId)) return notFound('Вакансия')
    const test = startTest(db, c, spec, grade, vacancyId, now)
    return json(sessionView(test), 201)
  }),

  route.candidate('get', '/me/tests', ({ ctx }) => {
    const list: TestSessionSummary[] = ctx.db.tests
      .filter((t) => t.candidateId === ctx.candidate.id)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .map((t) => ({
        id: t.id,
        specialization: t.specialization,
        declared_grade: t.declaredGrade,
        status: t.status,
        outcome: t.result?.outcome ?? null,
        assigned_grade: t.result?.assigned_grade ?? null,
        percentile: t.result?.percentile ?? null,
        started_at: t.startedAt,
        finished_at: t.finishedAt,
      }))
    return json(list)
  }),

  route.candidate('get', '/tests/:testId', ({ ctx, params }) => {
    const t = ownTest(ctx.db, ctx.candidate, params.testId)
    return t ? json(sessionView(t)) : notFound('Тест')
  }),

  route.candidate('get', '/tests/:testId/next', ({ ctx, params }) => {
    const t = ownTest(ctx.db, ctx.candidate, params.testId)
    if (!t) return notFound('Тест')
    if (t.status !== 'in_progress') return problem(409, 'test_not_active', 'Тест завершён', 'Тест уже завершён или время вышло.')
    return json(nextStep(t, ctx.now))
  }),

  route.candidate('post', '/tests/:testId/answers', ({ ctx, params, body }) => {
    const t = ownTest(ctx.db, ctx.candidate, params.testId)
    if (!t) return notFound('Тест')
    const parsed = parseBody(SubmitTestAnswerBody, body)
    if (!parsed.ok) return parsed.response
    const d = parsed.data
    const outcome = submitAnswerSafe(t, d, ctx.now)
    if (outcome === 'not_active') return problem(409, 'test_not_active', 'Тест завершён', 'Тест уже завершён или время вышло.')
    if (outcome === 'not_current') return problem(409, 'conflict', 'Ответ не на текущее задание', 'Обновите страницу, чтобы получить актуальное задание.')
    return json({ accepted: true, progress: progressOf(t) })
  }),

  route.candidate('post', '/tests/:testId/run', ({ ctx, params, body }) => {
    const t = ownTest(ctx.db, ctx.candidate, params.testId)
    if (!t) return notFound('Тест')
    if (t.status !== 'in_progress') return problem(409, 'test_not_active', 'Тест завершён')
    const parsed = parseBody(RunTestCodeBody, body)
    if (!parsed.ok) return parsed.response
    const served = t.served.find((s) => s.instanceId === parsed.data.instance_id)
    const practice = served ? PRACTICE_ITEMS.find((p) => p.id === served.itemId) : undefined
    if (!practice || !practice.publicTests) return problem(409, 'conflict', 'Нельзя запустить', 'Запуск доступен только для практического задания с кодом.')
    const ok = judgePractice(practice, { code: parsed.data.code })
    const started = Date.now()
    const result: CodeRunResult = {
      status: ok ? 'ok' : parsed.data.code.trim().length === 0 ? 'compile_error' : 'ok',
      passed: ok ? practice.publicTests.length : 0,
      total: practice.publicTests.length,
      duration_ms: 40 + (Date.now() - started) + Math.round(Math.random() * 60),
      cases: practice.publicTests.map((tc) => ({
        name: tc.name,
        passed: ok,
        actual: ok ? tc.expected : 'None',
        stderr: ok ? null : 'AssertionError: результат не совпадает с ожидаемым',
      })),
    }
    return json(result)
  }),

  route.candidate('post', '/tests/:testId/finish', ({ ctx, params }) => {
    const t = ownTest(ctx.db, ctx.candidate, params.testId)
    if (!t) return notFound('Тест')
    return json(finishTest(ctx.db, t, ctx.candidate, ctx.now))
  }),

  route.candidate('get', '/tests/:testId/result', ({ ctx, params }) => {
    const t = ownTest(ctx.db, ctx.candidate, params.testId)
    if (!t) return notFound('Тест')
    if (!t.result) return problem(409, 'test_not_active', 'Результата пока нет', 'Тест ещё не завершён.')
    return json(t.result)
  }),

  route.candidate('get', '/me/grade-history', ({ ctx }) =>
    json(
      ctx.db.gradeHistory
        .filter((g) => g.candidateId === ctx.candidate.id)
        .sort((a, b) => b.changed_at.localeCompare(a.changed_at))
        .map(({ candidateId: _omit, ...g }) => g),
    ),
  ),

  route.roles(['candidate', 'employer', 'admin'], 'get', '/assessment/families', () =>
    json(FAMILIES.map((f) => ({ id: f.id, title: f.title, specialization: f.specialization, competency: f.competency, type: f.type, a: f.a, b: f.b }))),
  ),

  route.roles(['candidate', 'employer', 'admin'], 'get', '/assessment/families/:familyId', ({ params }) => {
    const def = FAMILIES.find((f) => f.id === String(params.familyId))
    return def ? json(buildFamily(def)) : notFound('Семейство')
  }),
]

function submitAnswerSafe(
  t: TestRec,
  d: { instance_id: string; answer: { option_ids?: string[]; text?: string; code?: string; language?: string; skipped?: boolean }; rt_ms: number; paste_count: number; focus_lost_count: number },
  now: Date,
): 'ok' | 'not_active' | 'not_current' {
  // Таймаут: ответ после дедлайна (с минутным запасом) не принимается
  if (t.status === 'in_progress' && new Date(t.deadlineAt).getTime() + 60_000 < now.getTime()) {
    t.status = 'expired'
    t.finishedAt = t.deadlineAt
  }
  const outcome = submitAnswer(t, d.instance_id, d.answer as never, { rtMs: d.rt_ms, pasteCount: d.paste_count, focusLostCount: d.focus_lost_count }, now)
  if (outcome.ok) return 'ok'
  return outcome.reason ?? 'not_current'
}

