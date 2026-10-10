/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { RegularTask } from './regularTask.js';
import type { TaskAssignmentStatus } from './taskAssignmentStatus.js';
import type { TaskSubmission } from './taskSubmission.js';

export interface TaskAssignment {
  task: RegularTask;
  status: TaskAssignmentStatus;
  assigned_at: string;
  due_at: string;
  submission: TaskSubmission | null;
}
