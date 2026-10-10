/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Specialization } from './specialization.js';
import type { TaxonomySpecializationsItemCompetenciesItem } from './taxonomySpecializationsItemCompetenciesItem.js';

export type TaxonomySpecializationsItem = {
  id: Specialization;
  name: string;
  competencies: TaxonomySpecializationsItemCompetenciesItem[];
};
