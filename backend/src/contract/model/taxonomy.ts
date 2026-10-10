/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Skill } from './skill.js';
import type { TaxonomyGradesItem } from './taxonomyGradesItem.js';
import type { TaxonomyIndustriesItem } from './taxonomyIndustriesItem.js';
import type { TaxonomySpecializationsItem } from './taxonomySpecializationsItem.js';

export interface Taxonomy {
  specializations: TaxonomySpecializationsItem[];
  grades: TaxonomyGradesItem[];
  industries: TaxonomyIndustriesItem[];
  skills: Skill[];
  cities: string[];
}
