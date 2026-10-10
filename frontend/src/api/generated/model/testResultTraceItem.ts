/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type TestResultTraceItem = {
  index: number;
  /**
     * @minimum 1
     * @maximum 5
     */
  difficulty_level: number;
  correct: boolean;
  theta: number;
  se: number;
};
