/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export interface TaskScore {
  /**
     * @minimum 0
     * @maximum 100
     */
  final_score: number;
  /**
     * @maxLength 2000
     * @nullable
     */
  feedback?: string | null;
}
