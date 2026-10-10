/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ApplicationEventActor } from './applicationEventActor';
import type { ApplicationStatus } from './applicationStatus';

export interface ApplicationEvent {
  at: string;
  status: ApplicationStatus;
  actor: ApplicationEventActor;
  /** @nullable */
  note: string | null;
}
