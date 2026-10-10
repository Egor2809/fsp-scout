/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateCard } from './candidateCard.js';
import type { TaskSubmission } from './taskSubmission.js';

export type EmployerTaskSubmission = TaskSubmission & {
  candidate: CandidateCard;
};
