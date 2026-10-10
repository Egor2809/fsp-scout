/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { Specialization } from './specialization';
import type { TestBlueprintAdaptiveItems } from './testBlueprintAdaptiveItems';
import type { TestBlueprintCompetenciesItem } from './testBlueprintCompetenciesItem';
import type { TestBlueprintExtractedSkillsItem } from './testBlueprintExtractedSkillsItem';
import type { TestBlueprintPractice } from './testBlueprintPractice';

export interface TestBlueprint {
  vacancy_id: string;
  vacancy_title: string;
  specialization: Specialization;
  grade: Grade;
  extracted_skills: TestBlueprintExtractedSkillsItem[];
  /** Доли компетенций в бланке, сумма share = 1 */
  competencies: TestBlueprintCompetenciesItem[];
  adaptive_items: TestBlueprintAdaptiveItems;
  practice: TestBlueprintPractice;
  generated_at: string;
}
