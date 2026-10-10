/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ContactChannel } from './contactChannel.js';
import type { DeclineReason } from './declineReason.js';
import type { InvitationResponseDecision } from './invitationResponseDecision.js';

export interface InvitationResponse {
  decision: InvitationResponseDecision;
  reason: DeclineReason | null;
  /** @nullable */
  comment: string | null;
  /** Канал, который выбрал кандидат при принятии */
  channel: ContactChannel | null;
  /**
     * Удобный слот созвона (опционально)
     * @nullable
     */
  call_slot: string | null;
  /** @nullable */
  postponed_until: string | null;
  responded_at: string;
}
