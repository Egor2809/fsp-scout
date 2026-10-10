/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateSkillInput } from './candidateSkillInput.js';
import type { ExperienceInput } from './experienceInput.js';
import type { Industry } from './industry.js';
import type { SalaryRange } from './salaryRange.js';
import type { WorkFormat } from './workFormat.js';

export interface CandidateProfileUpdate {
  /**
     * @minLength 2
     * @maxLength 120
     */
  full_name: string;
  /**
     * @nullable
     * @pattern ^\+?[0-9 ()-]{10,20}$
     */
  phone?: string | null;
  /**
     * @nullable
     * @pattern ^@[A-Za-z0-9_]{4,32}$
     */
  telegram?: string | null;
  /**
     * @maxLength 100
     * @nullable
     */
  city?: string | null;
  relocation: boolean;
  /**
     * @maxLength 2000
     * @nullable
     */
  about?: string | null;
  /**
     * @minimum 0
     * @maximum 50
     */
  experience_years: number;
  /** @maxItems 20 */
  experience: ExperienceInput[];
  /** @maxItems 50 */
  skills: CandidateSkillInput[];
  industries: Industry[];
  /** @minItems 1 */
  work_formats: WorkFormat[];
  salary_expectation: SalaryRange;
}
