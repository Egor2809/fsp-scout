/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ContactChannel } from './contactChannel.js';

export interface InvitationAccept {
  /** Канал связи из своих контактов (должен быть заполнен в профиле) */
  channel: ContactChannel;
  /** @nullable */
  call_slot?: string | null;
  /**
     * @maxLength 1000
     * @nullable
     */
  message?: string | null;
}
