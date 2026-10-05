/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type ItemType = typeof ItemType[keyof typeof ItemType];


export const ItemType = {
  single_choice: 'single_choice',
  multiple_choice: 'multiple_choice',
  short_answer: 'short_answer',
  code: 'code',
  open_text: 'open_text',
} as const;
