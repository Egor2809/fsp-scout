/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { GradeEligibility } from './gradeEligibility.js';
import type { Specialization } from './specialization.js';

export interface TestEligibility {
  specialization: Specialization | null;
  current_grade: Grade | null;
  /** @nullable */
  last_grade_change_at: string | null;
  /**
     * Когда подтверждённый грейд снова можно сменить (90 дней)
     * @nullable
     */
  next_grade_change_at: string | null;
  /** @nullable */
  active_test_id: string | null;
  grades: GradeEligibility[];
}
