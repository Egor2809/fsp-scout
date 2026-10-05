/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { DeclineReason } from './declineReason';

export interface InvitationDecline {
  reason: DeclineReason;
  /**
     * Обязателен при `reason = other`
     * @maxLength 500
     * @nullable
     */
  comment?: string | null;
}
