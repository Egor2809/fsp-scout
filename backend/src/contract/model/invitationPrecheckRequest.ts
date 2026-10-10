/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SalaryRange } from './salaryRange.js';

export interface InvitationPrecheckRequest {
  candidate_id: string;
  salary: SalaryRange;
}
