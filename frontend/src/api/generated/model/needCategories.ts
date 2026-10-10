/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CategoryRecommendation } from './categoryRecommendation';
import type { SalaryRange } from './salaryRange';

export interface NeedCategories {
  need_id: string;
  salary: SalaryRange;
  items: CategoryRecommendation[];
}
