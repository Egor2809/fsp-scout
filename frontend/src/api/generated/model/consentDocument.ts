/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ConsentType } from './consentType';

export interface ConsentDocument {
  type: ConsentType;
  version: string;
  title: string;
  summary: string;
  /** Без него нельзя пользоваться платформой */
  required: boolean;
  document_url: string;
}
