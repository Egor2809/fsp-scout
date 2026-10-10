/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * passed — P(θ ≥ cut) ≥ 0.7; passed_confident — ещё и P(θ ≥ cut следующего) ≥ 0.7; failed
 */
export type TestOutcome = typeof TestOutcome[keyof typeof TestOutcome];


export const TestOutcome = {
  passed: 'passed',
  passed_confident: 'passed_confident',
  failed: 'failed',
} as const;
