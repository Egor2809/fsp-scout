/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ApplicationStatus } from './applicationStatus';

export type CandidateRelationApplication = {
  id: string;
  status: ApplicationStatus;
  vacancy_id: string;
} | null;
