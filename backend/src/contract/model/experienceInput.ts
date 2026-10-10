/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Industry } from './industry.js';

export interface ExperienceInput {
  /**
     * @minLength 2
     * @maxLength 120
     */
  role: string;
  /**
     * @maxLength 120
     * @nullable
     */
  company_name?: string | null;
  industry?: Industry | null;
  /** @pattern ^\d{4}-(0[1-9]|1[0-2])$ */
  start: string;
  /**
     * @nullable
     * @pattern ^\d{4}-(0[1-9]|1[0-2])$
     */
  end?: string | null;
  /**
     * @maxLength 1000
     * @nullable
     */
  description?: string | null;
}
