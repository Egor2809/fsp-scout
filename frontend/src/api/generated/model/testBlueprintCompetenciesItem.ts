/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SkillRef } from './skillRef';

export type TestBlueprintCompetenciesItem = {
  competency_id: string;
  name: string;
  /**
     * @minimum 0
     * @maximum 1
     */
  share: number;
  families_count: number;
  skills: SkillRef[];
};
