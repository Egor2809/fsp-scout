/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ContactChannel } from './contactChannel.js';

/**
 * Как компания предлагает связаться
 */
export interface InvitationContact {
  channel: ContactChannel;
  /**
     * @minLength 3
     * @maxLength 120
     */
  value: string;
}
