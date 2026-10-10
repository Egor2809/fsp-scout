/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateSkillInputSource } from './candidateSkillInputSource.js';
import type { SkillLevel } from './skillLevel.js';

export interface CandidateSkillInput {
  skill_id: string;
  level: SkillLevel;
  source: CandidateSkillInputSource;
}
