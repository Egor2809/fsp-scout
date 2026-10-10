/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ExperienceItem } from './experienceItem';
import type { ParsedResumeFieldsSkillsItem } from './parsedResumeFieldsSkillsItem';

export interface ParsedResumeFields {
  /** @nullable */
  full_name: string | null;
  /** @nullable */
  email: string | null;
  /** @nullable */
  phone: string | null;
  /** @nullable */
  telegram: string | null;
  /** @nullable */
  city: string | null;
  /** @nullable */
  experience_years: number | null;
  roles: string[];
  skills: ParsedResumeFieldsSkillsItem[];
  soft_skills: string[];
  experience: ExperienceItem[];
  /** @nullable */
  about: string | null;
}
