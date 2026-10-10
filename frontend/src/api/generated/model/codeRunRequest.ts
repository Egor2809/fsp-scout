/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage';

export interface CodeRunRequest {
  instance_id: string;
  /** @maxLength 20000 */
  code: string;
  language: CodeLanguage;
}
