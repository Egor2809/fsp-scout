/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateContacts } from './candidateContacts';
import type { CompanyBrief } from './companyBrief';
import type { InvitationCandidate } from './invitationCandidate';
import type { InvitationContact } from './invitationContact';
import type { InvitationEvent } from './invitationEvent';
import type { InvitationResponse } from './invitationResponse';
import type { InvitationSource } from './invitationSource';
import type { InvitationStatus } from './invitationStatus';
import type { SalaryRange } from './salaryRange';
import type { VacancyBrief } from './vacancyBrief';
import type { WorkFormat } from './workFormat';

export interface Invitation {
  id: string;
  status: InvitationStatus;
  title: string;
  description: string;
  salary: SalaryRange;
  work_format: WorkFormat;
  /** @nullable */
  city: string | null;
  company: CompanyBrief;
  contact_person: string;
  contact: InvitationContact;
  vacancy: VacancyBrief | null;
  candidate: InvitationCandidate;
  source: InvitationSource;
  created_at: string;
  /** @nullable */
  sent_at: string | null;
  /** @nullable */
  viewed_at: string | null;
  /** Срок ответа (по умолчанию 7 дней с отправки) */
  expires_at: string;
  response: InvitationResponse | null;
  /** Только для работодателя и только после принятия */
  candidate_contacts: CandidateContacts | null;
  events: InvitationEvent[];
}
