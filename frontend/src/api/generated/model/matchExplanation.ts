/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ExplanationFactor } from './explanationFactor';

export interface MatchExplanation {
  /**
     * Score = 0.6·Fit + 0.4·Strength − штрафы
     * @minimum 0
     * @maximum 100
     */
  score: number;
  /**
     * @minimum 0
     * @maximum 100
     */
  fit: number;
  /**
     * @minimum 0
     * @maximum 115
     */
  strength: number;
  /**
     * Три главных фактора для чипов
     * @maxItems 3
     */
  chips: ExplanationFactor[];
  /** Полный список для панели «Почему в подборке» */
  factors: ExplanationFactor[];
}
