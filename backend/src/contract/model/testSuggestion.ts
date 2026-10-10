/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { TestSuggestionAction } from './testSuggestionAction.js';

export interface TestSuggestion {
  action: TestSuggestionAction;
  grade: Grade | null;
  /**
     * `null` — доступно сразу
     * @nullable
     */
  available_at: string | null;
  message: string;
}
