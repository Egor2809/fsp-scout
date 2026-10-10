/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';
import type { TestBlueprintAdaptiveItems } from './testBlueprintAdaptiveItems.js';
import type { TestBlueprintCompetenciesItem } from './testBlueprintCompetenciesItem.js';
import type { TestBlueprintExtractedSkillsItem } from './testBlueprintExtractedSkillsItem.js';
import type { TestBlueprintPractice } from './testBlueprintPractice.js';

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
