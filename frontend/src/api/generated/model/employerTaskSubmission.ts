/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateCard } from './candidateCard';
import type { TaskSubmission } from './taskSubmission';

export type EmployerTaskSubmission = TaskSubmission & {
  candidate: CandidateCard;
};
