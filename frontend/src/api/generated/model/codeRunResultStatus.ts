/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type CodeRunResultStatus = typeof CodeRunResultStatus[keyof typeof CodeRunResultStatus];


export const CodeRunResultStatus = {
  ok: 'ok',
  compile_error: 'compile_error',
  runtime_error: 'runtime_error',
  timeout: 'timeout',
} as const;
