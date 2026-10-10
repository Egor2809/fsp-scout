/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Skill } from './skill';
import type { TaxonomyGradesItem } from './taxonomyGradesItem';
import type { TaxonomyIndustriesItem } from './taxonomyIndustriesItem';
import type { TaxonomySpecializationsItem } from './taxonomySpecializationsItem';

export interface Taxonomy {
  specializations: TaxonomySpecializationsItem[];
  grades: TaxonomyGradesItem[];
  industries: TaxonomyIndustriesItem[];
  skills: Skill[];
  cities: string[];
}
