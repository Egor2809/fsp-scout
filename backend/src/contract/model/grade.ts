/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)
 */
export type Grade = typeof Grade[keyof typeof Grade];


export const Grade = {
  junior: 'junior',
  middle: 'middle',
  senior: 'senior',
  lead: 'lead',
} as const;
