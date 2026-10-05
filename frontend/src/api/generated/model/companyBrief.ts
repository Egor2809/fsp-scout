/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Industry } from './industry';

export interface CompanyBrief {
  id: string;
  name: string;
  industry: Industry;
  /** @nullable */
  city: string | null;
  /** Проверенный работодатель (ИНН/домен почты) */
  verified: boolean;
}
