/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Category } from './category';

/**
 * Подтверждённое место кандидата в категории
 */
export interface CategoryStanding {
  category: Category;
  /**
     * @minimum 1
     * @maximum 99
     */
  percentile: number;
  confirmed_at: string;
  test_id: string;
}
