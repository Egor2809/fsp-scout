/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export interface RubricCriterion {
  /**
     * @minLength 3
     * @maxLength 200
     */
  criterion: string;
  /**
     * @minimum 0
     * @maximum 1
     */
  weight: number;
}
