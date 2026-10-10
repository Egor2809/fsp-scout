/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { TestItem } from './testItem.js';
import type { TestProgress } from './testProgress.js';
import type { TestStepStatus } from './testStepStatus.js';

export interface TestStep {
  status: TestStepStatus;
  item: TestItem | null;
  progress: TestProgress;
  deadline_at: string;
}
