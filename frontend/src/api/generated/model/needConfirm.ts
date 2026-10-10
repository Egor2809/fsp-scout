/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { Industry } from './industry';
import type { SalaryRange } from './salaryRange';
import type { Specialization } from './specialization';
import type { WorkFormat } from './workFormat';

export interface NeedConfirm {
  specialization: Specialization;
  grade: Grade;
  /** @maxItems 15 */
  must_skills: string[];
  /** @maxItems 15 */
  nice_skills: string[];
  /** @minItems 1 */
  work_formats: WorkFormat[];
  /** @nullable */
  city: string | null;
  industry: Industry | null;
  salary: SalaryRange;
}
