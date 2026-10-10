/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export interface FspIndexComponent {
  achievement_id: string;
  title: string;
  level_weight: number;
  result_weight: number;
  /**
     * Релевантность дисциплины специализации
     * @minimum 0
     * @maximum 1
     */
  relevance: number;
  /**
     * Затухание (период полураспада 2 года)
     * @minimum 0
     * @maximum 1
     */
  decay: number;
  /** Вклад в индекс, баллы */
  contribution: number;
}
