/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Уверенность с учётом SE и флагов
 */
export type TestResultConfidence = typeof TestResultConfidence[keyof typeof TestResultConfidence];


export const TestResultConfidence = {
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const;
