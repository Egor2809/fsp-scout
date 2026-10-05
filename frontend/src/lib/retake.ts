import type { EligibilityReason, Grade, GradeEligibility, TestOutcome } from '@/api/generated/model'
import { GRADES, gradeForExperience, nextGrade, prevGrade } from './labels'

/**
 * Правила пересдачи (SOLUTION.md, раздел 4.4; contracts/openapi.yaml):
 *  - подтверждённый грейд меняется не чаще 1 раза в 90 дней;
 *  - повторная попытка на тот же грейд — через 30 дней;
 *  - после провала сразу доступна одна попытка на грейд ниже;
 *  - после уверенного прохождения сразу доступна одна попытка на грейд выше;
 *  - пока есть незавершённый тест, новый начать нельзя.
 * Эту же функцию использует мок-бэкенд, поэтому UI и «сервер» считают одинаково.
 */
export const GRADE_CHANGE_COOLDOWN_DAYS = 90
export const RETAKE_COOLDOWN_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

export interface TestAttempt {
  grade: Grade
  outcome: TestOutcome
  finishedAt: Date
}

export interface RetakeState {
  /** Подтверждённый грейд (в выбранной специализации) */
  currentGrade: Grade | null
  /** Когда подтверждённый грейд последний раз менялся */
  lastGradeChangeAt: Date | null
  /** Завершённые попытки в специализации */
  attempts: readonly TestAttempt[]
  /** Есть незавершённый тест */
  hasActiveTest: boolean
  /** Стаж из опроса — для рекомендации */
  experienceYears: number | null
}

export interface EligibilityResult {
  grades: GradeEligibility[]
  nextGradeChangeAt: Date | null
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

function latest(attempts: readonly TestAttempt[]): TestAttempt | null {
  let best: TestAttempt | null = null
  for (const a of attempts) if (!best || a.finishedAt > best.finishedAt) best = a
  return best
}

export function computeEligibility(state: RetakeState, now: Date): EligibilityResult {
  const nextGradeChangeAt =
    state.currentGrade && state.lastGradeChangeAt ? addDays(state.lastGradeChangeAt, GRADE_CHANGE_COOLDOWN_DAYS) : null
  const recommended = state.experienceYears === null ? null : gradeForExperience(state.experienceYears)
  const last = latest(state.attempts)

  const grades = GRADES.map((grade): GradeEligibility => {
    const base = { grade, recommended: grade === recommended }
    const deny = (reason: EligibilityReason, availableAt: Date | null): GradeEligibility => ({
      ...base,
      can_start: false,
      reason,
      available_at: availableAt ? availableAt.toISOString() : null,
    })

    if (state.hasActiveTest) return deny('test_in_progress', null)

    // Исключения: сразу после провала — одна попытка на грейд ниже,
    // после уверенного прохождения — одна попытка на грейд выше
    if (last && last.outcome === 'failed' && prevGrade(last.grade) === grade) {
      return { ...base, can_start: true, reason: null, available_at: null }
    }
    if (last && last.outcome === 'passed_confident' && nextGrade(last.grade) === grade) {
      return { ...base, can_start: true, reason: null, available_at: null }
    }

    const lastAtGrade = latest(state.attempts.filter((a) => a.grade === grade))
    if (lastAtGrade) {
      const retakeAt = addDays(lastAtGrade.finishedAt, RETAKE_COOLDOWN_DAYS)
      if (now < retakeAt) {
        // Попытка на грейд ниже после провала уже использована
        const usedLowerAttempt =
          state.attempts.some(
            (a) => a.outcome === 'failed' && prevGrade(a.grade) === grade && a.finishedAt <= lastAtGrade.finishedAt,
          ) && lastAtGrade.outcome === 'failed'
        return deny(usedLowerAttempt ? 'lower_attempt_used' : 'retake_cooldown', retakeAt)
      }
    }

    if (state.currentGrade && grade !== state.currentGrade && nextGradeChangeAt && now < nextGradeChangeAt) {
      return deny('grade_change_cooldown', nextGradeChangeAt)
    }

    return { ...base, can_start: true, reason: null, available_at: null }
  })

  return { grades, nextGradeChangeAt }
}

/** Даты после завершения теста: повтор того же грейда и следующая смена грейда. */
export function retakeDatesAfter(
  finishedAt: Date,
  gradeChanged: boolean,
  lastGradeChangeAt: Date | null,
): { nextRetakeAt: Date; nextGradeChangeAt: Date | null } {
  const changeAt = gradeChanged ? finishedAt : lastGradeChangeAt
  return {
    nextRetakeAt: addDays(finishedAt, RETAKE_COOLDOWN_DAYS),
    nextGradeChangeAt: changeAt ? addDays(changeAt, GRADE_CHANGE_COOLDOWN_DAYS) : null,
  }
}

export const eligibilityReasonText: Record<EligibilityReason, string> = {
  grade_change_cooldown: 'Подтверждённый грейд меняется не чаще раза в 90 дней',
  retake_cooldown: 'Повторная попытка на этот грейд — через 30 дней',
  lower_attempt_used: 'Попытка на грейд ниже после провала уже использована',
  test_in_progress: 'Сначала завершите начатый тест',
  survey_required: 'Сначала пройдите опрос',
}
