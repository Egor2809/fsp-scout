/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { TestItem } from './testItem';
import type { TestProgress } from './testProgress';
import type { TestStepStatus } from './testStepStatus';

export interface TestStep {
  status: TestStepStatus;
  item: TestItem | null;
  progress: TestProgress;
  deadline_at: string;
}
