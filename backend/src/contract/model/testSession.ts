/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';
import type { TestProgress } from './testProgress.js';
import type { TestStatus } from './testStatus.js';

export interface TestSession {
  id: string;
  specialization: Specialization;
  declared_grade: Grade;
  status: TestStatus;
  started_at: string;
  deadline_at: string;
  /** @nullable */
  finished_at: string | null;
  time_limit_sec: number;
  progress: TestProgress;
  /** @nullable */
  vacancy_id: string | null;
}
