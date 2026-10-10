/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.
 */
export interface SalaryRange {
  /**
     * @minimum 10000
     * @maximum 10000000
     */
  from: number;
  /**
     * @minimum 10000
     * @maximum 10000000
     */
  to: number;
}
