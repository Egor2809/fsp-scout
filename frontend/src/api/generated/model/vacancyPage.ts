/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { PageMeta } from './pageMeta';
import type { Vacancy } from './vacancy';

export type VacancyPage = PageMeta & {
  items: Vacancy[];
};
