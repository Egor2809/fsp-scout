/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Category } from './category';
import type { CategoryRecommendationKind } from './categoryRecommendationKind';
import type { SalaryRadar } from './salaryRadar';

export interface CategoryRecommendation {
  category: Category;
  /** Основная или соседняя категория */
  kind: CategoryRecommendationKind;
  /** @minimum 0 */
  candidate_count: number;
  /** @nullable */
  median_expectation: number | null;
  reason: string;
  radar: SalaryRadar;
}
