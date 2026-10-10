/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Category } from './category.js';
import type { SalaryRadarHistogramItem } from './salaryRadarHistogramItem.js';
import type { SalaryRadarVerdict } from './salaryRadarVerdict.js';
import type { SalaryRange } from './salaryRange.js';

/**
 * Распределение ожиданий кандидатов категории относительно вилки
 */
export interface SalaryRadar {
  category: Category;
  salary: SalaryRange;
  /** @minimum 0 */
  candidates_total: number;
  /**
     * Доля кандидатов, чьи ожидания (нижняя граница) выше верха вилки
     * @minimum 0
     * @maximum 1
     */
  share_above: number;
  /**
     * Доля кандидатов, чьи ожидания пересекаются с вилкой
     * @minimum 0
     * @maximum 1
     */
  share_within: number;
  /**
     * Доля кандидатов, чьи ожидания (верхняя граница) ниже низа вилки
     * @minimum 0
     * @maximum 1
     */
  share_below: number;
  /** @nullable */
  median: number | null;
  /** @nullable */
  p25: number | null;
  /** @nullable */
  p75: number | null;
  histogram: SalaryRadarHistogramItem[];
  verdict: SalaryRadarVerdict;
  message: string;
}
