/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { OnboardingStep } from './onboardingStep';

export interface OnboardingState {
  /** Даны обязательные согласия (personal_data) */
  consents_given: boolean;
  survey_completed: boolean;
  grade_confirmed: boolean;
  next_step: OnboardingStep;
  /** @nullable */
  active_test_id: string | null;
}
