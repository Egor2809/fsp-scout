/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { InvitationEventActor } from './invitationEventActor.js';
import type { InvitationStatus } from './invitationStatus.js';

export interface InvitationEvent {
  id: string;
  at: string;
  status: InvitationStatus;
  actor: InvitationEventActor;
  /** @nullable */
  note: string | null;
}
