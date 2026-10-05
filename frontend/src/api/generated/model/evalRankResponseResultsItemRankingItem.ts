/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ExplanationFactor } from './explanationFactor';

export type EvalRankResponseResultsItemRankingItem = {
  candidate_id: string;
  score: number;
  factors: ExplanationFactor[];
};
