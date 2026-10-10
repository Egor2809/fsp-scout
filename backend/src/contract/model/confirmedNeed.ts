/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Industry } from './industry.js';
import type { SalaryRange } from './salaryRange.js';
import type { SkillRef } from './skillRef.js';
import type { Specialization } from './specialization.js';
import type { WorkFormat } from './workFormat.js';

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
