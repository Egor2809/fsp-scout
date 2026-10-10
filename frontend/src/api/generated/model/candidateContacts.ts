/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ContactChannel } from './contactChannel';

export interface CandidateContacts {
  full_name: string;
  email: string;
  /** @nullable */
  phone: string | null;
  /** @nullable */
  telegram: string | null;
  preferred_channel: ContactChannel;
}
