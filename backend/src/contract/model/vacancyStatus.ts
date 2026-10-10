/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type VacancyStatus = typeof VacancyStatus[keyof typeof VacancyStatus];


export const VacancyStatus = {
  draft: 'draft',
  published: 'published',
  closed: 'closed',
} as const;
