/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';
import type { TestOutcome } from './testOutcome.js';
import type { TestStatus } from './testStatus.js';

export interface TestSessionSummary {
  id: string;
  specialization: Specialization;
  declared_grade: Grade;
  status: TestStatus;
  outcome: TestOutcome | null;
  assigned_grade: Grade | null;
  /**
     * @minimum 1
     * @maximum 99
     * @nullable
     */
  percentile: number | null;
  started_at: string;
  /** @nullable */
  finished_at: string | null;
}
