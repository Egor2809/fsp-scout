/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ExplanationFactor } from './explanationFactor';

/**
 * Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом)
 */
export type VacancyMatch = {
  /**
     * @minimum 0
     * @maximum 100
     */
  score: number;
  chips: ExplanationFactor[];
} | null;
