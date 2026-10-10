/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { PageMeta } from './pageMeta.js';
import type { Vacancy } from './vacancy.js';

export type VacancyPage = PageMeta & {
  items: Vacancy[];
};
