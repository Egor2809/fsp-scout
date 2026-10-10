/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CompanyBrief } from './companyBrief.js';

export interface VacancyBrief {
  id: string;
  title: string;
  company: CompanyBrief;
}
