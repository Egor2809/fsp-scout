import type {
  Answer,
  CandidateSkill,
  Grade,
  SkillLevel,
  Specialization,
  TestItem,
  TestProgress,
  TestResult,
  TestStep,
} from '@/api/generated/model'
import {
  difficultyLevel,
  estimateThetaEap,
  mulberry32,
  normalCdf,
  probabilityAbove,
  selectNextItem,
  type ItemResponse,
} from '@/lib/irt'
import { categoryLabel, nextGrade, prevGrade } from '@/lib/labels'
import { retakeDatesAfter } from '@/lib/retake'
import { bankFor, isShortAnswerCorrect, ITEM_BANK, PRACTICE_ITEMS, practiceFor, type BankItem, type PracticeItem } from '../data/items'
import { competencyName, skillName } from '../data/taxonomy'
import { GRADE_THETA } from '../db/seed'
import type { CandidateRec, MockDb, TestRec } from '../db/types'

/**
 * Мок-движок CAT (SOLUTION.md, 4.1–4.4): 2PL, EAP, выбор по информации Фишера (randomesque top-5),
 * ограничение по компетенции, остановка по SE(θ) < 0.35 или максимуму заданий, затем практика.
 * В демо длина короче (6–10 заданий), чтобы сценарий проходился за пару минут.
 */
export const DEMO_ADAPTIVE_MIN = 6
export const DEMO_ADAPTIVE_MAX = 10
export const TEST_TIME_LIMIT_SEC = 40 * 60
const SE_STOP = 0.35
const PASS_PROBABILITY = 0.7

/** Пороги грейдов на шкале θ (в проде — упрощённый Ангоф + пилот). */
export const GRADE_CUTS: Record<Grade, number> = { junior: -1.3, middle: -0.2, senior: 0.8, lead: 1.6 }

const PRACTICE_PARAMS = { a: 1.2 }

interface Resolved {
  kind: 'bank' | 'practice'
  bank?: BankItem
  practice?: PracticeItem
}

function resolveItem(itemId: string): Resolved | null {
  const bank = ITEM_BANK.find((i) => i.id === itemId)
  if (bank) return { kind: 'bank', bank }
  const practice = PRACTICE_ITEMS.find((p) => p.id === itemId)
  if (practice) return { kind: 'practice', practice }
  return null
}

function adaptiveResponses(test: TestRec): ItemResponse[] {
  return test.served
    .filter((s) => s.block === 'adaptive' && s.answeredAt)
    .map((s) => {
      const item = ITEM_BANK.find((i) => i.id === s.itemId)
      return { a: item?.a ?? 1, b: item?.b ?? 0, correct: Boolean(s.correct) }
    })
}

function allResponses(test: TestRec): ItemResponse[] {
  const list = adaptiveResponses(test)
  if (test.practicePassed !== null) {
    list.push({ a: PRACTICE_PARAMS.a, b: GRADE_CUTS[test.declaredGrade], correct: test.practicePassed })
  }
  return list
}

export function progressOf(test: TestRec): TestProgress {
  const adaptiveAnswered = test.served.filter((s) => s.block === 'adaptive' && s.answeredAt).length
  const practiceTotal = practiceFor(test.specialization) ? 1 : 0
  const practiceAnswered = test.served.filter((s) => s.block === 'practice' && s.answeredAt).length
  const current = test.served.find((s) => !s.answeredAt)
  const adaptiveDone = isAdaptiveDone(test)
  const block = current?.block ?? (adaptiveDone && practiceAnswered < practiceTotal ? 'practice' : 'adaptive')
  return {
    block,
    answered: adaptiveAnswered + practiceAnswered,
    adaptive_answered: adaptiveAnswered,
    adaptive_min: test.adaptiveMin,
    adaptive_max: test.adaptiveMax,
    practice_answered: practiceAnswered,
    practice_total: practiceTotal,
  }
}

function isAdaptiveDone(test: TestRec): boolean {
  const answered = test.served.filter((s) => s.block === 'adaptive' && s.answeredAt)
  if (answered.length >= test.adaptiveMax) return true
  const bank = bankFor(test.specialization)
  if (answered.length >= bank.length) return true
  if (answered.length < test.adaptiveMin) return false
  const last = answered[answered.length - 1]
  return (last?.seAfter ?? 1) < SE_STOP
}

function toTestItem(test: TestRec, servedIndex: number): TestItem {
  const served = test.served[servedIndex]
  if (!served) throw new Error('served item not found')
  const resolved = resolveItem(served.itemId)
  if (resolved?.kind === 'bank' && resolved.bank) {
    const item = resolved.bank
    return {
      instance_id: served.instanceId,
      index: servedIndex + 1,
      block: 'adaptive',
      type: item.type,
      competency: { id: item.competency, name: competencyName(item.competency) },
      difficulty_level: difficultyLevel(item.b),
      title: item.title,
      prompt: item.prompt,
      code: item.code ?? null,
      options: item.options ?? null,
      answer_language: null,
      starter_code: null,
      max_length: item.type === 'short_answer' ? 120 : null,
      public_tests: null,
    }
  }
  const p = resolved?.practice
  if (!p) throw new Error('item not found')
  return {
    instance_id: served.instanceId,
    index: servedIndex + 1,
    block: 'practice',
    type: p.type,
    competency: { id: p.competency, name: competencyName(p.competency) },
    difficulty_level: difficultyLevel(GRADE_CUTS[test.declaredGrade]),
    title: p.title,
    prompt: p.prompt,
    code: p.code ?? null,
    options: null,
    answer_language: p.language,
    starter_code: p.starter,
    max_length: p.maxLength,
    public_tests: p.publicTests,
  }
}

export function startTest(
  db: MockDb,
  candidate: CandidateRec,
  specialization: Specialization,
  declaredGrade: Grade,
  vacancyId: string | null,
  now: Date,
): TestRec {
  const test: TestRec = {
    id: crypto.randomUUID(),
    candidateId: candidate.id,
    specialization,
    declaredGrade,
    status: 'in_progress',
    startedAt: now.toISOString(),
    deadlineAt: new Date(now.getTime() + TEST_TIME_LIMIT_SEC * 1000).toISOString(),
    finishedAt: null,
    timeLimitSec: TEST_TIME_LIMIT_SEC,
    vacancyId,
    seed: Math.floor(Math.random() * 1_000_000),
    adaptiveMin: DEMO_ADAPTIVE_MIN,
    adaptiveMax: DEMO_ADAPTIVE_MAX,
    served: [],
    practicePassed: null,
    result: null,
  }
  db.tests.push(test)
  return test
}

/** Следующий шаг: текущее неотвеченное задание, новое адаптивное, практика или готовность к завершению. */
export function nextStep(test: TestRec, now: Date): TestStep {
  const pendingIndex = test.served.findIndex((s) => !s.answeredAt)
  if (pendingIndex >= 0) {
    return { status: 'item', item: toTestItem(test, pendingIndex), progress: progressOf(test), deadline_at: test.deadlineAt }
  }
  if (!isAdaptiveDone(test)) {
    const bank = bankFor(test.specialization)
    const responses = adaptiveResponses(test)
    // Старт около порога заявленного грейда, дальше — текущая EAP-оценка
    const theta = responses.length === 0 ? GRADE_CUTS[test.declaredGrade] : estimateThetaEap(responses).theta
    const used = new Set(test.served.map((s) => s.itemId))
    const competencyCounts = new Map<string, number>()
    for (const s of test.served) {
      const item = ITEM_BANK.find((i) => i.id === s.itemId)
      if (item) competencyCounts.set(item.competency, (competencyCounts.get(item.competency) ?? 0) + 1)
    }
    const random = mulberry32(test.seed + test.served.length * 7919)
    const maxPerCompetency = Math.max(2, Math.ceil(test.adaptiveMax / 3))
    const item =
      selectNextItem(bank, theta, used, random, { topK: 3, competencyCounts, maxPerCompetency }) ??
      selectNextItem(bank, theta, used, random, { topK: 3 })
    if (item) {
      test.served.push({
        instanceId: crypto.randomUUID(),
        itemId: item.id,
        block: 'adaptive',
        servedAt: now.toISOString(),
        answeredAt: null,
        correct: null,
        skipped: false,
        rtMs: 0,
        pasteCount: 0,
        focusLostCount: 0,
        thetaAfter: null,
        seAfter: null,
      })
      return { status: 'item', item: toTestItem(test, test.served.length - 1), progress: progressOf(test), deadline_at: test.deadlineAt }
    }
  }
  const practice = practiceFor(test.specialization)
  if (practice && !test.served.some((s) => s.block === 'practice')) {
    test.served.push({
      instanceId: crypto.randomUUID(),
      itemId: practice.id,
      block: 'practice',
      servedAt: now.toISOString(),
      answeredAt: null,
      correct: null,
      skipped: false,
      rtMs: 0,
      pasteCount: 0,
      focusLostCount: 0,
      thetaAfter: null,
      seAfter: null,
    })
    return { status: 'item', item: toTestItem(test, test.served.length - 1), progress: progressOf(test), deadline_at: test.deadlineAt }
  }
  return { status: 'ready_to_finish', item: null, progress: progressOf(test), deadline_at: test.deadlineAt }
}

/** Мок-песочница: проверяем, что решение не заглушка (реальный прогон — Piston на бэкенде). */
export function judgePractice(practice: PracticeItem, answer: Answer): boolean {
  if (practice.type === 'open_text') {
    const text = (answer.text ?? '').trim()
    return text.length >= 120
  }
  const code = (answer.code ?? '').trim()
  if (!code || code === (practice.starter ?? '').trim()) return false
  const body = code.replace(/#.*$/gm, '').replace(/\/\/.*$/gm, '')
  const hasStub = /^\s*pass\s*$/m.test(body) || /\/\/\s*ваш код/i.test(code)
  return /return/.test(body) && !hasStub && body.length > (practice.starter?.length ?? 0) + 15
}

export interface AnswerOutcome {
  ok: boolean
  reason?: 'not_current' | 'not_active'
}

export function submitAnswer(
  test: TestRec,
  instanceId: string,
  answer: Answer,
  meta: { rtMs: number; pasteCount: number; focusLostCount: number },
  now: Date,
): AnswerOutcome {
  if (test.status !== 'in_progress') return { ok: false, reason: 'not_active' }
  const served = test.served.find((s) => s.instanceId === instanceId)
  if (!served || served.answeredAt) return { ok: false, reason: 'not_current' }
  const resolved = resolveItem(served.itemId)
  let correct = false
  if (!answer.skipped) {
    if (resolved?.kind === 'bank' && resolved.bank) {
      const item = resolved.bank
      if (item.type === 'short_answer') correct = isShortAnswerCorrect(answer.text ?? '', item.correct)
      else {
        const chosen = [...new Set(answer.option_ids ?? [])].sort()
        const expected = [...item.correct].sort()
        correct = chosen.length === expected.length && chosen.every((id, i) => id === expected[i])
      }
    } else if (resolved?.practice) {
      correct = judgePractice(resolved.practice, answer)
      test.practicePassed = correct
    }
  } else if (resolved?.practice) {
    test.practicePassed = false
  }
  served.answeredAt = now.toISOString()
  served.correct = correct
  served.skipped = Boolean(answer.skipped)
  served.rtMs = meta.rtMs
  served.pasteCount = meta.pasteCount
  served.focusLostCount = meta.focusLostCount
  if (served.block === 'adaptive') {
    const est = estimateThetaEap(adaptiveResponses(test))
    served.thetaAfter = Math.round(est.theta * 100) / 100
    served.seAfter = Math.round(est.se * 100) / 100
  }
  return { ok: true }
}

function levelFor(maxB: number): SkillLevel {
  if (maxB >= 1) return 'advanced'
  if (maxB >= 0) return 'confident'
  return 'basic'
}

/** Перцентиль θ внутри категории (по распределению θ кандидатов грейда). */
export function percentileInCategory(theta: number, grade: Grade): number {
  const { mean, sd } = GRADE_THETA[grade]
  return Math.max(1, Math.min(99, Math.round(normalCdf((theta - mean) / sd) * 100)))
}

export function finishTest(db: MockDb, test: TestRec, candidate: CandidateRec, now: Date): TestResult {
  if (test.result) return test.result
  const responses = allResponses(test)
  const estimate = estimateThetaEap(responses)
  const declared = test.declaredGrade
  const passProb = probabilityAbove(estimate, GRADE_CUTS[declared])
  const higher = nextGrade(declared)
  const confident = higher ? probabilityAbove(estimate, GRADE_CUTS[higher]) >= PASS_PROBABILITY : false
  const passed = passProb >= PASS_PROBABILITY
  const outcome: TestResult['outcome'] = passed ? (confident ? 'passed_confident' : 'passed') : 'failed'

  // Подтверждённые навыки: из верно решённых заданий
  const bySkill = new Map<string, { correct: number; total: number; maxB: number }>()
  for (const s of test.served) {
    if (!s.answeredAt) continue
    const resolved = resolveItem(s.itemId)
    const skills = resolved?.bank?.skills ?? resolved?.practice?.skills ?? []
    const b = resolved?.bank?.b ?? GRADE_CUTS[declared]
    for (const id of skills) {
      const cur = bySkill.get(id) ?? { correct: 0, total: 0, maxB: -9 }
      cur.total += 1
      if (s.correct) {
        cur.correct += 1
        cur.maxB = Math.max(cur.maxB, b)
      }
      bySkill.set(id, cur)
    }
  }
  const confirmedSkills: CandidateSkill[] = [...bySkill.entries()]
    .filter(([, v]) => v.correct > 0 && v.correct / v.total >= 0.5)
    .map(([id, v]) => ({
      skill_id: id,
      name: skillName(id),
      level: levelFor(v.maxB),
      source: 'test' as const,
      verified: true,
      score: Math.round(55 + 45 * (v.correct / v.total) * Math.min(1, 0.6 + (v.maxB + 2) / 6)),
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  // Баллы по компетенциям (вес задания растёт со сложностью)
  const byComp = new Map<string, { got: number; max: number; items: number }>()
  for (const s of test.served) {
    if (!s.answeredAt) continue
    const resolved = resolveItem(s.itemId)
    const comp = resolved?.bank?.competency ?? resolved?.practice?.competency
    if (!comp) continue
    const b = resolved?.bank?.b ?? GRADE_CUTS[declared]
    const w = 1 + (b + 2) / 4
    const cur = byComp.get(comp) ?? { got: 0, max: 0, items: 0 }
    cur.max += w
    cur.items += 1
    if (s.correct) cur.got += w
    byComp.set(comp, cur)
  }
  const competencies = [...byComp.entries()].map(([id, v]) => ({
    competency_id: id,
    name: competencyName(id),
    score: Math.round((v.got / Math.max(v.max, 1e-9)) * 100),
    items: v.items,
  }))

  const flags: TestResult['flags'] = []
  const pastes = test.served.reduce((s, x) => s + x.pasteCount, 0)
  const focus = test.served.reduce((s, x) => s + x.focusLostCount, 0)
  const fastHard = test.served.filter((s) => {
    const item = ITEM_BANK.find((i) => i.id === s.itemId)
    return s.correct && item && item.b > 1 && s.rtMs > 0 && s.rtMs < 4000
  }).length
  if (pastes > 0) flags.push({ code: 'paste', severity: pastes > 2 ? 'warning' : 'info', message: `Вставка из буфера: ${pastes}` })
  if (focus >= 3) flags.push({ code: 'focus_loss', severity: 'warning', message: `Переключения вкладки: ${focus}` })
  if (fastHard > 0) flags.push({ code: 'fast_correct', severity: 'warning', message: 'Очень быстрые верные ответы на сложных заданиях' })
  const warnings = flags.filter((f) => f.severity === 'warning').length

  const previous = candidate.standing
  const sameSpec = previous?.specialization === test.specialization
  let assigned: Grade | null = sameSpec && previous ? previous.grade : null
  let gradeChanged = false
  let percentile: number | null = sameSpec && previous ? previous.percentile : null
  if (passed) {
    gradeChanged = !previous || previous.grade !== declared || !sameSpec
    assigned = declared
    percentile = percentileInCategory(estimate.theta, declared)
  }

  const finishedAt = now.toISOString()
  const dates = retakeDatesAfter(now, gradeChanged, candidate.gradeChangedAt ? new Date(candidate.gradeChangedAt) : null)
  const lower = prevGrade(declared)
  const suggestion: TestResult['suggestion'] =
    outcome === 'passed_confident' && higher
      ? { action: 'try_higher', grade: higher, available_at: null, message: `Вы уверенно прошли ${categoryLabel(test.specialization, declared)}. Можно сразу попробовать ${categoryLabel(test.specialization, higher)}.` }
      : outcome === 'failed' && lower
        ? { action: 'try_lower', grade: lower, available_at: null, message: `Грейд не понижается принудительно. Сразу доступна одна попытка на ${categoryLabel(test.specialization, lower)}.` }
        : outcome === 'failed'
          ? { action: 'none', grade: null, available_at: dates.nextRetakeAt.toISOString(), message: 'Повторная попытка будет доступна через 30 дней.' }
          : { action: 'none', grade: null, available_at: null, message: 'Грейд подтверждён, профиль в выдаче работодателям.' }

  const trace = test.served
    .filter((s) => s.block === 'adaptive' && s.answeredAt)
    .map((s, i) => {
      const item = ITEM_BANK.find((x) => x.id === s.itemId)
      return { index: i + 1, difficulty_level: difficultyLevel(item?.b ?? 0), correct: Boolean(s.correct), theta: s.thetaAfter ?? 0, se: s.seAfter ?? 1 }
    })

  const result: TestResult = {
    test_id: test.id,
    specialization: test.specialization,
    declared_grade: declared,
    outcome,
    assigned_grade: assigned,
    category: assigned ? { specialization: test.specialization, grade: assigned, label: categoryLabel(test.specialization, assigned) } : null,
    percentile,
    theta: Math.round(estimate.theta * 100) / 100,
    se: Math.round(estimate.se * 100) / 100,
    confidence: estimate.se < 0.4 && warnings === 0 ? 'high' : estimate.se < 0.6 && warnings <= 1 ? 'medium' : 'low',
    confirmed_skills: confirmedSkills,
    competencies,
    suggestion,
    flags,
    items_answered: test.served.filter((s) => s.answeredAt).length,
    duration_sec: Math.round((now.getTime() - new Date(test.startedAt).getTime()) / 1000),
    finished_at: finishedAt,
    next_retake_at: dates.nextRetakeAt.toISOString(),
    next_grade_change_at: dates.nextGradeChangeAt ? dates.nextGradeChangeAt.toISOString() : null,
    trace,
  }

  test.status = 'finished'
  test.finishedAt = finishedAt
  test.result = result

  // Обновление профиля: категория, θ, подтверждённые навыки, история грейдов
  if (passed) {
    candidate.standing = { specialization: test.specialization, grade: declared, percentile: percentile ?? 50, confirmedAt: finishedAt, testId: test.id }
    candidate.theta = result.theta
    candidate.se = result.se
    candidate.specialization = test.specialization
    if (gradeChanged) {
      candidate.gradeChangedAt = finishedAt
      db.gradeHistory.push({
        id: crypto.randomUUID(),
        candidateId: candidate.id,
        specialization: test.specialization,
        grade: declared,
        previous_grade: sameSpec && previous ? previous.grade : null,
        changed_at: finishedAt,
        test_id: test.id,
        reason: test.served.length > 0 && db.tests.some((t) => t.candidateId === candidate.id && t.id !== test.id && t.result?.outcome === 'failed' && t.finishedAt && now.getTime() - new Date(t.finishedAt).getTime() < 24 * 3600 * 1000) ? 'test_lower' : 'test_passed',
      })
    }
  }
  for (const s of confirmedSkills) {
    const existing = candidate.skills.find((x) => x.skill_id === s.skill_id)
    if (existing) Object.assign(existing, s)
    else candidate.skills.push(s)
  }
  candidate.updatedAt = finishedAt
  candidate.lastActiveAt = finishedAt
  return result
}
