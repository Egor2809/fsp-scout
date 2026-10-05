/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type TestResultCompetenciesItem = {
  competency_id: string;
  name: string;
  /**
     * @minimum 0
     * @maximum 100
     */
  score: number;
  /** @minimum 0 */
  items: number;
};
