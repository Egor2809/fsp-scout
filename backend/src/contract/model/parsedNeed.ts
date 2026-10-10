/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Industry } from './industry.js';
import type { SalaryRange } from './salaryRange.js';
import type { SkillRef } from './skillRef.js';
import type { Specialization } from './specialization.js';
import type { WorkFormat } from './workFormat.js';

export interface ParsedNeed {
  specialization: Specialization | null;
  grade: Grade | null;
  must_skills: SkillRef[];
  nice_skills: SkillRef[];
  work_formats: WorkFormat[];
  /** @nullable */
  city: string | null;
  industry: Industry | null;
  /** Вилка, если найдена в тексте. Всё равно требует подтверждения */
  salary: SalaryRange | null;
  /** Термины, которые не удалось сопоставить со справочником */
  unrecognized: string[];
}
