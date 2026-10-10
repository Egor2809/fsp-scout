/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Вилка, стек, формат, компания, не ищу, другое
 */
export type DeclineReason = typeof DeclineReason[keyof typeof DeclineReason];


export const DeclineReason = {
  salary: 'salary',
  stack: 'stack',
  format: 'format',
  company: 'company',
  not_looking: 'not_looking',
  other: 'other',
} as const;
