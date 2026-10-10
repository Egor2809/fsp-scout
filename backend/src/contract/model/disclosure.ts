/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { DisclosureReason } from './disclosureReason.js';

export interface Disclosure {
  revealed: boolean;
  reason: DisclosureReason | null;
  /** @nullable */
  revealed_at: string | null;
  /**
     * ID инвайта или отклика
     * @nullable
     */
  source_id: string | null;
}
