/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage.js';

/**
 * single_choice/multiple_choice — option_ids; short_answer/open_text — text; code — code + language; skipped — пропуск
 */
export interface Answer {
  option_ids?: string[];
  /** @maxLength 4000 */
  text?: string;
  /** @maxLength 20000 */
  code?: string;
  language?: CodeLanguage;
  skipped?: boolean;
}
