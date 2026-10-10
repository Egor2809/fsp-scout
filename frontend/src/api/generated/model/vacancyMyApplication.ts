/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ApplicationStatus } from './applicationStatus';

/**
 * Только для кандидата
 */
export type VacancyMyApplication = {
  id: string;
  status: ApplicationStatus;
} | null;
