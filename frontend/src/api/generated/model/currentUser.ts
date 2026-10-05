/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CompanyBrief } from './companyBrief';
import type { OnboardingState } from './onboardingState';
import type { Role } from './role';

export interface CurrentUser {
  id: string;
  role: Role;
  email: string;
  display_name: string;
  /** Только для кандидата */
  onboarding: OnboardingState | null;
  /** Только для работодателя */
  company: CompanyBrief | null;
}
