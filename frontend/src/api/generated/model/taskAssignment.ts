/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { RegularTask } from './regularTask';
import type { TaskAssignmentStatus } from './taskAssignmentStatus';
import type { TaskSubmission } from './taskSubmission';

export interface TaskAssignment {
  task: RegularTask;
  status: TaskAssignmentStatus;
  assigned_at: string;
  due_at: string;
  submission: TaskSubmission | null;
}
