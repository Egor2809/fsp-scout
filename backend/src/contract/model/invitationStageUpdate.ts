/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { InvitationStageUpdateStatus } from './invitationStageUpdateStatus.js';

export interface InvitationStageUpdate {
  status: InvitationStageUpdateStatus;
  /**
     * @maxLength 500
     * @nullable
     */
  note?: string | null;
}
