/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { SalaryRange } from './salaryRange';
import type { Specialization } from './specialization';
import type { VacancyStatus } from './vacancyStatus';
import type { WorkFormat } from './workFormat';

export interface VacancyInput {
  /**
     * @minLength 5
     * @maxLength 120
     */
  title: string;
  /**
     * @minLength 50
     * @maxLength 5000
     */
  description: string;
  specialization: Specialization;
  grade: Grade;
  /**
     * @minItems 1
     * @maxItems 15
     */
  must_skills: string[];
  /** @maxItems 15 */
  nice_skills: string[];
  work_format: WorkFormat;
  /** @nullable */
  city: string | null;
  salary: SalaryRange;
  status: VacancyStatus;
}
