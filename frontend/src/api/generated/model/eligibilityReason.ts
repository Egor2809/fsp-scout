/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * grade_change_cooldown — 90 дней со смены грейда; retake_cooldown — 30 дней с попытки на этот грейд; lower_attempt_used — попытка на грейд ниже после провала уже использована; test_in_progress — есть незавершённый тест; survey_required — нет опроса
 */
export type EligibilityReason = typeof EligibilityReason[keyof typeof EligibilityReason];


export const EligibilityReason = {
  grade_change_cooldown: 'grade_change_cooldown',
  retake_cooldown: 'retake_cooldown',
  lower_attempt_used: 'lower_attempt_used',
  test_in_progress: 'test_in_progress',
  survey_required: 'survey_required',
} as const;
