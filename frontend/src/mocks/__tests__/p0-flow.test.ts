import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import * as Z from '@/api/generated/zod/scout.zod'
import type {
  CandidateDetail,
  InvitationPrecheck,
  Invitation,
  Need,
  NeedCategories,
  Problem,
  Search,
  SearchResults,
  TestEligibility,
  TestResult,
  TestSession,
  TestStep,
} from '@/api/generated/model'
import { DEMO_CANDIDATE_FSP_ID, DEMO_COMPANY_ID, DEMO_PERSONAS } from '@/auth/personas'
import { getScoutAPIMock } from '@/mocks/generated'
import { statefulHandlers } from '@/mocks/handlers'
import { ITEM_BANK, PRACTICE_ITEMS } from '@/mocks/data/items'
import { call, createMockServer, tokenFor } from '@/test/mockApi'

const api = createMockServer()
beforeAll(api.start)
afterAll(api.stop)

const employer = DEMO_PERSONAS.find((p) => p.key === 'employer')!
const alexey = DEMO_PERSONAS.find((p) => p.key === 'candidate-fsp')!
const maria = DEMO_PERSONAS.find((p) => p.key === 'candidate-no-fsp')!
const EMP = tokenFor(employer.userId, 'employer', employer.displayName, employer.email)
const ALEX = tokenFor(alexey.userId, 'candidate', alexey.displayName, alexey.email)
const MARIA = tokenFor(maria.userId, 'candidate', maria.displayName, maria.email)
const NEW_ID = '2f1f9a3e-7a43-4c8b-9d9e-6a1b2c3d4e5f'
const NEW = tokenFor(NEW_ID, 'candidate', 'Ольга Новикова', 'o.novikova@demo.scout')

function handlerKeys(list: { info: { method: unknown; path: unknown } }[]) {
  return new Set(list.map((h) => `${String(h.info.method).toUpperCase()} ${String(h.info.path).replace('*/api/v1', '').replace(/^\*/, '').replace(/:[A-Za-z]+/g, ':p')}`))
}

describe('контракт мок-бэкенда', () => {
  it('каждая операция контракта покрыта ручным stateful-обработчиком', () => {
    const generated = handlerKeys(getScoutAPIMock() as never)
    const manual = handlerKeys(statefulHandlers as never)
    const missing = [...generated].filter((k) => !manual.has(k))
    expect(missing).toEqual([])
  })

  it('без токена — 401 в формате RFC 9457', async () => {
    const res = await call<Problem>('GET', '/me')
    expect(res.status).toBe(401)
    expect(Z.GetMeResponse.safeParse(res.data).success).toBe(false)
    expect(res.data.code).toBe('unauthorized')
    expect(res.data.type).toMatch(/^https:\/\//)
  })

  it('ответы соответствуют схемам контракта', async () => {
    const checks: [string, string, string, { safeParse: (v: unknown) => { success: boolean; error?: unknown } }][] = [
      [ALEX, 'GET', '/me', Z.GetMeResponse],
      [ALEX, 'GET', '/me/profile', Z.GetMyProfileResponse],
      [ALEX, 'GET', '/me/privacy', Z.GetMyPrivacyResponse],
      [ALEX, 'GET', '/me/consents', Z.GetMyConsentsResponse],
      [ALEX, 'GET', '/me/fsp', Z.GetMyFspResponse],
      [MARIA, 'GET', '/me/fsp', Z.GetMyFspResponse],
      [ALEX, 'GET', '/me/invitations', Z.ListMyInvitationsResponse],
      [ALEX, 'GET', '/me/test-eligibility', Z.GetMyTestEligibilityResponse],
      [ALEX, 'GET', '/me/tests', Z.ListMyTestsResponse],
      [ALEX, 'GET', '/me/grade-history', Z.GetMyGradeHistoryResponse],
      [ALEX, 'GET', '/me/applications', Z.ListMyApplicationsResponse],
      [ALEX, 'GET', '/me/tasks', Z.ListMyTasksResponse],
      [ALEX, 'GET', '/me/card-preview', Z.GetMyCardPreviewResponse],
      [ALEX, 'GET', '/vacancies', Z.ListVacanciesResponse],
      [ALEX, 'GET', '/taxonomy', Z.GetTaxonomyResponse],
      [ALEX, 'GET', '/assessment/families/go-slice-append', Z.GetShowcaseFamilyResponse],
      [EMP, 'GET', '/company', Z.GetMyCompanyResponse],
      [EMP, 'GET', '/company/invitation-quota', Z.GetInvitationQuotaResponse],
      [EMP, 'GET', '/company/vacancies', Z.ListMyCompanyVacanciesResponse],
      [EMP, 'GET', '/invitations', Z.ListCompanyInvitationsResponse],
      [EMP, 'GET', '/invitations/stats', Z.GetInvitationStatsResponse],
      [EMP, 'GET', '/searches', Z.ListSearchesResponse],
      [EMP, 'GET', '/candidates?specialization=backend', Z.ListCandidatesResponse],
      [EMP, 'GET', '/regular-tasks', Z.ListCompanyTasksResponse],
    ]
    for (const [token, method, path, schema] of checks) {
      const res = await call(method, path, { token })
      expect(res.status, path).toBe(200)
      const parsed = schema.safeParse(res.data)
      expect(parsed.success, `${path}: ${JSON.stringify(parsed.error)?.slice(0, 400)}`).toBe(true)
    }
  })

  it('кандидат не видит чужое: чужой инвайт — 404, работодательские эндпоинты — 403', async () => {
    const list = await call<Invitation[]>('GET', '/me/invitations', { token: ALEX })
    const foreign = list.data[0]!
    expect((await call('GET', `/invitations/${foreign.id}`, { token: MARIA })).status).toBe(404)
    expect((await call('POST', `/invitations/${foreign.id}/accept`, { token: MARIA, body: { channel: 'email' } })).status).toBe(404)
    expect((await call<Problem>('GET', '/invitations', { token: ALEX })).status).toBe(403)
  })

  it('без истории ФСП — нейтральное состояние без ошибок', async () => {
    const fsp = await call<{ has_history: boolean; index: number; bonus: number }>('GET', '/me/fsp', { token: MARIA })
    expect(fsp.status).toBe(200)
    expect(fsp.data).toMatchObject({ has_history: false, index: 0, bonus: 0 })
  })
})

describe('P0: путь кандидата и работодателя', () => {
  let testId = ''

  it('новый кандидат: согласия → опрос → выбор грейда → адаптивный тест → результат', async () => {
    const me = await call<{ onboarding: { next_step: string } }>('GET', '/me', { token: NEW })
    expect(me.data.onboarding.next_step).toBe('consents')

    const surveyEarly = await call<Problem>('POST', '/surveys', { token: NEW, body: {} })
    expect(surveyEarly.data.code).toBe('consent_required')

    const consents = await call('POST', '/me/consents', {
      token: NEW,
      body: { items: [
        { type: 'personal_data', version: '2026-09', given: true },
        { type: 'profile_visibility', version: '2026-09', given: true },
        { type: 'fsp_data', version: '2026-09', given: false },
      ] },
    })
    expect(consents.status).toBe(200)

    const badSalary = await call<Problem>('POST', '/surveys', {
      token: NEW,
      body: { industries: ['fintech'], specialization: 'backend', primary_stack: ['go'], experience_years: 2.5, work_formats: ['remote'], city: 'Москва', relocation: false, salary_expectation: { from: 300000, to: 200000 } },
    })
    expect(badSalary.status).toBe(422)
    expect(badSalary.data.code).toBe('salary_range_invalid')

    const survey = await call('POST', '/surveys', {
      token: NEW,
      body: { industries: ['fintech'], specialization: 'backend', primary_stack: ['go', 'postgresql', 'kafka'], experience_years: 2.5, work_formats: ['hybrid', 'remote'], city: 'Москва', relocation: false, salary_expectation: { from: 240000, to: 290000 } },
    })
    expect(survey.status).toBe(201)

    const elig = await call<TestEligibility>('GET', '/me/test-eligibility', { token: NEW })
    expect(elig.data.grades.find((g) => g.grade === 'middle')).toMatchObject({ can_start: true, recommended: true })

    const started = await call<TestSession>('POST', '/tests', { token: NEW, body: { declared_grade: 'middle' } })
    expect(started.status).toBe(201)
    testId = started.data.id
    expect((await call<Problem>('POST', '/tests', { token: NEW, body: { declared_grade: 'middle' } })).data.code).toBe('test_in_progress')

    const difficulties: number[] = []
    for (let guard = 0; guard < 20; guard++) {
      const step = await call<TestStep>('GET', `/tests/${testId}/next`, { token: NEW })
      expect(Z.GetNextTestItemResponse.safeParse(step.data).success).toBe(true)
      if (step.data.status === 'ready_to_finish') break
      const item = step.data.item!
      // Идемпотентность: повторный next отдаёт то же задание
      expect((await call<TestStep>('GET', `/tests/${testId}/next`, { token: NEW })).data.item?.instance_id).toBe(item.instance_id)
      difficulties.push(item.difficulty_level)
      const bank = ITEM_BANK.find((b) => b.title === item.title && (b.prompt === item.prompt))
      let answer: Record<string, unknown>
      if (item.block === 'practice') {
        const practice = PRACTICE_ITEMS.find((p) => p.title === item.title)!
        answer = { code: 'def dedupe(events):\n    seen = set()\n    out = []\n    for e in events:\n        if e["id"] not in seen:\n            seen.add(e["id"])\n            out.append(e["id"])\n    return out\n', language: practice.language }
      } else if (item.type === 'short_answer') answer = { text: bank!.correct[0] }
      else answer = { option_ids: bank!.correct }
      const ack = await call('POST', `/tests/${testId}/answers`, { token: NEW, body: { instance_id: item.instance_id, answer, rt_ms: 21000, paste_count: 0, focus_lost_count: 0 } })
      expect(ack.status).toBe(200)
      // Повторный ответ на то же задание — конфликт
      expect((await call('POST', `/tests/${testId}/answers`, { token: NEW, body: { instance_id: item.instance_id, answer, rt_ms: 1, paste_count: 0, focus_lost_count: 0 } })).status).toBe(409)
    }
    // Адаптивность: верные ответы ведут к более сложным заданиям
    expect(Math.max(...difficulties)).toBeGreaterThan(difficulties[0]!)

    const result = await call<TestResult>('POST', `/tests/${testId}/finish`, { token: NEW })
    expect(Z.FinishTestResponse.safeParse(result.data).success).toBe(true)
    expect(result.data.outcome).not.toBe('failed')
    expect(result.data.category?.label).toBe('Backend · Middle')
    expect(result.data.percentile).toBeGreaterThan(0)
    expect(result.data.confirmed_skills.length).toBeGreaterThan(0)
    expect(result.data.next_grade_change_at).not.toBeNull()

    const me2 = await call<{ onboarding: { next_step: string } }>('GET', '/me', { token: NEW })
    expect(me2.data.onboarding.next_step).toBe('done')
  })

  it('работодатель: потребность → чипы и вилка → категории → подборка с объяснением → уточнение без потери шорт-листа', async () => {
    const need = await call<Need>('POST', '/needs', {
      token: EMP,
      body: { raw_text: 'Ищем бэкенд-разработчика уровня middle на Go в платёжный сервис: PostgreSQL обязательно, желательно Kafka и k8s. Гибрид в Москве или удалёнка, 250–320 тысяч на руки.' },
    })
    expect(need.status).toBe(201)
    const parsed = need.data.parsed
    expect(parsed).toMatchObject({ specialization: 'backend', grade: 'middle', city: 'Москва', industry: 'fintech', salary: { from: 250000, to: 320000 } })
    expect(parsed.must_skills.map((s) => s.id)).toEqual(expect.arrayContaining(['go', 'postgresql']))
    expect(parsed.nice_skills.map((s) => s.id)).toEqual(expect.arrayContaining(['kafka', 'kubernetes']))

    expect((await call<Problem>('GET', `/needs/${need.data.id}/categories`, { token: EMP })).data.code).toBe('need_not_confirmed')
    const confirmBody = { specialization: 'backend', grade: 'middle', must_skills: ['go', 'postgresql'], nice_skills: ['kafka', 'kubernetes'], work_formats: ['hybrid', 'remote'], city: 'Москва', industry: 'fintech', salary: { from: 250000, to: 320000 } }
    expect((await call('PUT', `/needs/${need.data.id}`, { token: EMP, body: { ...confirmBody, salary: undefined } })).status).toBe(422)
    expect((await call('PUT', `/needs/${need.data.id}`, { token: EMP, body: confirmBody })).status).toBe(200)

    const cats = await call<NeedCategories>('GET', `/needs/${need.data.id}/categories`, { token: EMP })
    expect(cats.data.items[0]?.category.label).toBe('Backend · Middle')
    expect(cats.data.items[0]?.candidate_count).toBeGreaterThan(0)
    expect(cats.data.items[0]?.radar.message).toMatch(/кандидатов Backend · Middle/)

    const filters = { specialization: 'backend', grades: ['middle'], must_skills: ['go', 'postgresql'], nice_skills: ['kafka', 'kubernetes'], work_formats: ['hybrid', 'remote'], city: 'Москва', include_relocation: true, industries: ['fintech'], salary: { from: 250000, to: 320000 }, fsp_only: false, fsp_level_min: null, availability: ['active', 'open'] }
    const search = await call<Search>('POST', '/searches', { token: EMP, body: { need_id: need.data.id, filters } })
    expect(search.status).toBe(201)
    const results = await call<SearchResults>('GET', `/searches/${search.data.id}/results`, { token: EMP })
    expect(Z.GetSearchResultsResponse.safeParse(results.data).success).toBe(true)
    expect(results.data.total).toBeGreaterThan(0)
    const first = results.data.items[0]!
    expect(first.explanation.chips.length).toBe(3)
    expect(first.candidate.contacts).toBeNull()
    expect(JSON.stringify(first.candidate)).not.toContain('Смирнов')
    const ids = results.data.items.map((i) => i.candidate.id)
    expect(ids).toContain(DEMO_CANDIDATE_FSP_ID)

    const shortlisted = await call<Search>('PUT', `/searches/${search.data.id}/shortlist/${DEMO_CANDIDATE_FSP_ID}`, { token: EMP })
    expect(shortlisted.data.shortlist).toHaveLength(1)
    const refined = await call<Search>('PATCH', `/searches/${search.data.id}`, { token: EMP, body: { filters: { ...filters, must_skills: ['go', 'postgresql', 'kafka'] } } })
    expect(refined.data.current_version).toBe(2)
    expect(refined.data.versions[1]?.label).toContain('Kafka')
    expect(refined.data.shortlist.map((e) => e.candidate_id)).toEqual([DEMO_CANDIDATE_FSP_ID])
  })

  it('инвайт: блокировка ниже порога → отправка → кандидат принимает → контакты раскрыты, статусы у обеих сторон', async () => {
    const card = await call<CandidateDetail>('GET', `/candidates/${DEMO_CANDIDATE_FSP_ID}`, { token: EMP })
    expect(card.data.contacts).toBeNull()
    expect(card.data.disclosure.revealed).toBe(false)

    const low = await call<InvitationPrecheck>('POST', '/invitations/precheck', { token: EMP, body: { candidate_id: DEMO_CANDIDATE_FSP_ID, salary: { from: 180000, to: 220000 } } })
    expect(low.data).toMatchObject({ salary_ok: false, can_send: false })
    expect(JSON.stringify(low.data)).not.toContain('240000')

    const body = {
      candidate_id: DEMO_CANDIDATE_FSP_ID,
      title: 'Middle Go-разработчик (платёжный шлюз)',
      description: 'Развиваем шлюз эквайринга: идемпотентные платежи, outbox, аудит операций. Команда из 6 инженеров.',
      salary: { from: 180000, to: 220000 },
      work_format: 'hybrid',
      city: 'Москва',
      contact_person: 'Ирина Волкова',
      contact: { channel: 'email', value: 'hr@severcode.ru' },
      response_days: 7,
    }
    const blocked = await call<Problem>('POST', '/invitations', { token: EMP, body })
    expect(blocked.status).toBe(422)
    expect(blocked.data.code).toBe('salary_below_floor')
    expect(blocked.data.detail).not.toContain('240')

    const noSalary = await call<Problem>('POST', '/invitations', { token: EMP, body: { ...body, salary: undefined } })
    expect(noSalary.status).toBe(422)

    const sent = await call<Invitation>('POST', '/invitations', { token: EMP, body: { ...body, salary: { from: 260000, to: 320000 } } })
    expect(sent.status).toBe(201)
    expect(sent.data.status).toBe('sent')
    expect((await call<Problem>('POST', '/invitations', { token: EMP, body: { ...body, salary: { from: 260000, to: 320000 } } })).data.code).toBe('already_invited')

    const inbox = await call<Invitation[]>('GET', '/me/invitations', { token: ALEX })
    const mine = inbox.data.find((i) => i.id === sent.data.id)!
    expect(mine.company.id).toBe(DEMO_COMPANY_ID)
    expect((await call<Invitation>('POST', `/invitations/${mine.id}/view`, { token: ALEX })).data.status).toBe('viewed')
    const accepted = await call<Invitation>('POST', `/invitations/${mine.id}/accept`, { token: ALEX, body: { channel: 'telegram', message: 'Удобно созвониться вечером' } })
    expect(accepted.data.status).toBe('accepted')
    expect((await call<Problem>('POST', `/invitations/${mine.id}/decline`, { token: ALEX, body: { reason: 'salary' } })).data.code).toBe('invitation_not_actionable')

    const empView = await call<Invitation>('GET', `/invitations/${mine.id}`, { token: EMP })
    expect(empView.data.status).toBe('accepted')
    expect(empView.data.candidate_contacts?.telegram).toBe('@a_smirnov_dev')
    const revealed = await call<CandidateDetail>('GET', `/candidates/${DEMO_CANDIDATE_FSP_ID}`, { token: EMP })
    expect(revealed.data.contacts?.full_name).toBe('Алексей Смирнов')
    expect(revealed.data.disclosure).toMatchObject({ revealed: true, reason: 'invitation_accepted' })

    const stage = await call<Invitation>('POST', `/invitations/${mine.id}/stage`, { token: EMP, body: { status: 'interview' } })
    expect(stage.data.status).toBe('interview')
    const again = await call<Invitation>('GET', `/invitations/${mine.id}`, { token: ALEX })
    expect(again.data.status).toBe('interview')
    expect(again.data.candidate_contacts).toBeNull()
  })

  it('отказ с причиной и «не сейчас» (один раз)', async () => {
    const inbox = await call<Invitation[]>('GET', '/me/invitations', { token: ALEX })
    const active = inbox.data.filter((i) => i.status === 'sent' || i.status === 'viewed')
    const [a, b] = active
    expect((await call<Problem>('POST', `/invitations/${a!.id}/decline`, { token: ALEX, body: { reason: 'other' } })).status).toBe(422)
    expect((await call<Invitation>('POST', `/invitations/${a!.id}/decline`, { token: ALEX, body: { reason: 'stack', comment: 'Не пишу на Java' } })).data.response?.reason).toBe('stack')
    if (b) {
      expect((await call<Invitation>('POST', `/invitations/${b.id}/postpone`, { token: ALEX, body: {} })).data.status).toBe('postponed')
      expect((await call<Problem>('POST', `/invitations/${b.id}/postpone`, { token: ALEX, body: {} })).data.code).toBe('invitation_not_actionable')
    }
  })

  it('правило пересдачи: смена грейда не чаще раза в 90 дней', async () => {
    const elig = await call<TestEligibility>('GET', '/me/test-eligibility', { token: ALEX })
    const senior = elig.data.grades.find((g) => g.grade === 'senior')!
    expect(senior).toMatchObject({ can_start: false, reason: 'grade_change_cooldown' })
    expect(senior.available_at).toBe(elig.data.next_grade_change_at)
    const res = await call<Problem>('POST', '/tests', { token: ALEX, body: { declared_grade: 'senior' } })
    expect(res.data.code).toBe('retake_locked')
    expect(res.data.available_at).toBeTruthy()
  })
})
