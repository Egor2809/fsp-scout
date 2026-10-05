/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { InvitationContact } from './invitationContact';
import type { InvitationSource } from './invitationSource';
import type { SalaryRange } from './salaryRange';
import type { WorkFormat } from './workFormat';

export interface InvitationCreate {
  candidate_id: string;
  /**
     * @minLength 5
     * @maxLength 120
     */
  title: string;
  /**
     * Описание предложения
     * @minLength 50
     * @maxLength 3000
     */
  description: string;
  salary: SalaryRange;
  work_format: WorkFormat;
  /**
     * @maxLength 100
     * @nullable
     */
  city: string | null;
  /**
     * @minLength 2
     * @maxLength 120
     */
  contact_person: string;
  contact: InvitationContact;
  /**
     * @minimum 3
     * @maximum 14
     */
  response_days: number;
  /** @nullable */
  vacancy_id?: string | null;
  source?: InvitationSource;
}
