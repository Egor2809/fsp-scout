/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Availability } from './availability';
import type { CandidateSkill } from './candidateSkill';
import type { CategoryStanding } from './categoryStanding';
import type { ExperienceItem } from './experienceItem';
import type { Industry } from './industry';
import type { ProfileVisibility } from './profileVisibility';
import type { SalaryRange } from './salaryRange';
import type { Specialization } from './specialization';
import type { WorkFormat } from './workFormat';

export interface CandidateProfile {
  id: string;
  full_name: string;
  email: string;
  /** @nullable */
  phone: string | null;
  /** @nullable */
  telegram: string | null;
  /** @nullable */
  city: string | null;
  relocation: boolean;
  /**
     * @maxLength 2000
     * @nullable
     */
  about: string | null;
  specialization: Specialization | null;
  /** `null` — грейд не подтверждён */
  standing: CategoryStanding | null;
  /**
     * @minimum 0
     * @maximum 50
     */
  experience_years: number;
  experience: ExperienceItem[];
  skills: CandidateSkill[];
  industries: Industry[];
  work_formats: WorkFormat[];
  salary_expectation: SalaryRange | null;
  availability: Availability;
  /**
     * Полнота профиля, %
     * @minimum 0
     * @maximum 100
     */
  completeness: number;
  visibility: ProfileVisibility;
  updated_at: string;
}
