/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CompanyUpdateSize } from './companyUpdateSize.js';
import type { Industry } from './industry.js';

export interface CompanyUpdate {
  /**
     * @minLength 2
     * @maxLength 120
     */
  name: string;
  industry: Industry;
  /**
     * @minLength 20
     * @maxLength 3000
     */
  description: string;
  /** @nullable */
  website?: string | null;
  /** @nullable */
  city: string | null;
  size: CompanyUpdateSize;
  /**
     * @nullable
     * @pattern ^(\d{10}|\d{12})$
     */
  inn?: string | null;
  contact_email: string;
  /** @nullable */
  contact_phone?: string | null;
}
