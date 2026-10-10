/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { TestProgress } from './testProgress.js';

export interface AnswerAck {
  accepted: boolean;
  progress: TestProgress;
}
