/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Availability } from './availability.js';
import type { CandidateSkill } from './candidateSkill.js';
import type { CategoryStanding } from './categoryStanding.js';
import type { ExperienceItem } from './experienceItem.js';
import type { Industry } from './industry.js';
import type { ProfileVisibility } from './profileVisibility.js';
import type { SalaryRange } from './salaryRange.js';
import type { Specialization } from './specialization.js';
import type { WorkFormat } from './workFormat.js';

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
