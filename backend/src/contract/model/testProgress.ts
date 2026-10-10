/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { TestBlock } from './testBlock.js';

export interface TestProgress {
  block: TestBlock;
  /**
     * Всего ответов
     * @minimum 0
     */
  answered: number;
  /** @minimum 0 */
  adaptive_answered: number;
  adaptive_min: number;
  adaptive_max: number;
  /** @minimum 0 */
  practice_answered: number;
  /**
     * 0 — практический блок выключен
     * @minimum 0
     */
  practice_total: number;
}
