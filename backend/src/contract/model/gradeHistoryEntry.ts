/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { GradeHistoryEntryReason } from './gradeHistoryEntryReason.js';
import type { Specialization } from './specialization.js';

export interface GradeHistoryEntry {
  id: string;
  specialization: Specialization;
  grade: Grade;
  previous_grade: Grade | null;
  changed_at: string;
  /** @nullable */
  test_id: string | null;
  reason: GradeHistoryEntryReason;
}
