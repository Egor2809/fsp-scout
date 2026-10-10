/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Industry } from './industry.js';
import type { SalaryRange } from './salaryRange.js';
import type { Specialization } from './specialization.js';
import type { WorkFormat } from './workFormat.js';

export interface SurveyCreate {
  /**
     * @minItems 1
     * @maxItems 5
     */
  industries: Industry[];
  specialization: Specialization;
  /**
     * ID навыков из справочника
     * @minItems 1
     * @maxItems 15
     */
  primary_stack: string[];
  /**
     * @minimum 0
     * @maximum 50
     */
  experience_years: number;
  /** @minItems 1 */
  work_formats: WorkFormat[];
  /**
     * @maxLength 100
     * @nullable
     */
  city: string | null;
  relocation: boolean;
  salary_expectation: SalaryRange;
}
