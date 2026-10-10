/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SkillLevel } from './skillLevel';
import type { SkillSource } from './skillSource';

export interface CandidateSkill {
  skill_id: string;
  name: string;
  level: SkillLevel;
  source: SkillSource;
  /** Подтверждён тестом, заданием или ФСП */
  verified: boolean;
  /**
     * Балл по навыку в тесте, если подтверждён тестом
     * @minimum 0
     * @maximum 100
     * @nullable
     */
  score: number | null;
}
