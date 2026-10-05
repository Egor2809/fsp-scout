/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ApplicationStatusUpdateStatus } from './applicationStatusUpdateStatus';

export interface ApplicationStatusUpdate {
  status: ApplicationStatusUpdateStatus;
  /**
     * @maxLength 500
     * @nullable
     */
  note?: string | null;
}
