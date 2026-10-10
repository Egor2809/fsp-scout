/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ConsentType } from './consentType';

export interface Consent {
  type: ConsentType;
  version: string;
  given_at: string;
  /** @nullable */
  revoked_at: string | null;
}
