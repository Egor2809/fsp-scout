/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ApplicationEvent } from './applicationEvent.js';
import type { ApplicationStatus } from './applicationStatus.js';
import type { VacancyBrief } from './vacancyBrief.js';

export interface Application {
  id: string;
  vacancy: VacancyBrief;
  status: ApplicationStatus;
  /** @nullable */
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  events: ApplicationEvent[];
}
