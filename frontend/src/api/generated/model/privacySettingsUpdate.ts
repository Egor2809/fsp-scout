/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Availability } from './availability';

export interface PrivacySettingsUpdate {
  availability: Availability;
  /**
     * @minimum 10000
     * @maximum 10000000
     * @nullable
     */
  salary_floor: number | null;
  /** @maxItems 50 */
  hidden_company_ids: string[];
  show_fsp: boolean;
  show_company_names: boolean;
  show_city: boolean;
}
