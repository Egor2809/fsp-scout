/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SkillRef } from './skillRef';
import type { TestBlueprintExtractedSkillsItemImportance } from './testBlueprintExtractedSkillsItemImportance';

export type TestBlueprintExtractedSkillsItem = {
  skill: SkillRef;
  /**
     * @minimum 0
     * @maximum 1
     */
  weight: number;
  importance: TestBlueprintExtractedSkillsItemImportance;
};
