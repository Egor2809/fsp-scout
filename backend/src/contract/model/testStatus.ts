/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type TestStatus = typeof TestStatus[keyof typeof TestStatus];


export const TestStatus = {
  in_progress: 'in_progress',
  finished: 'finished',
  expired: 'expired',
  abandoned: 'abandoned',
} as const;
