/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { Industry } from './industry';
import type { SalaryRange } from './salaryRange';
import type { SkillRef } from './skillRef';
import type { Specialization } from './specialization';
import type { WorkFormat } from './workFormat';

export interface ConfirmedNeed {
  specialization: Specialization;
  grade: Grade;
  must_skills: SkillRef[];
  nice_skills: SkillRef[];
  work_formats: WorkFormat[];
  /** @nullable */
  city: string | null;
  industry: Industry | null;
  salary: SalaryRange;
}
