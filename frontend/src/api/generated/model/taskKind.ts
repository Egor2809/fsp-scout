/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Мини-код / ревью фрагмента / «предложи подход»
 */
export type TaskKind = typeof TaskKind[keyof typeof TaskKind];


export const TaskKind = {
  code: 'code',
  review: 'review',
  approach: 'approach',
} as const;
