/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateContacts } from './candidateContacts.js';
import type { CompanyBrief } from './companyBrief.js';
import type { CompanyTrust } from './companyTrust.js';
import type { InvitationCandidate } from './invitationCandidate.js';
import type { InvitationContact } from './invitationContact.js';
import type { InvitationEvent } from './invitationEvent.js';
import type { InvitationResponse } from './invitationResponse.js';
import type { InvitationSource } from './invitationSource.js';
import type { InvitationStatus } from './invitationStatus.js';
import type { SalaryRange } from './salaryRange.js';
import type { VacancyBrief } from './vacancyBrief.js';
import type { WorkFormat } from './workFormat.js';

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
  company_trust?: CompanyTrust;
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
