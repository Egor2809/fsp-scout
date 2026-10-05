/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { EligibilityReason } from './eligibilityReason';
import type { Grade } from './grade';

export interface GradeEligibility {
  grade: Grade;
  can_start: boolean;
  reason: EligibilityReason | null;
  /**
     * Когда станет доступно (если `can_start = false` из-за срока)
     * @nullable
     */
  available_at: string | null;
  /** Рекомендуем по стажу из опроса */
  recommended: boolean;
}
