/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CompanySize } from './companySize.js';
import type { Industry } from './industry.js';

export interface Company {
  id: string;
  name: string;
  industry: Industry;
  /** @maxLength 3000 */
  description: string;
  /** @nullable */
  website: string | null;
  /** @nullable */
  city: string | null;
  size: CompanySize;
  /**
     * Необязателен в MVP
     * @nullable
     * @pattern ^(\d{10}|\d{12})$
     */
  inn: string | null;
  contact_email: string;
  /** @nullable */
  contact_phone: string | null;
  verified: boolean;
  created_at: string;
}
