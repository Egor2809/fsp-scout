/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage.js';

/**
 * Нужно хотя бы одно из `answer_text`, `code`
 */
export interface TaskSubmissionCreate {
  /**
     * @maxLength 4000
     * @nullable
     */
  answer_text?: string | null;
  /**
     * @maxLength 20000
     * @nullable
     */
  code?: string | null;
  language?: CodeLanguage | null;
}
