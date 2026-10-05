/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { EvalRankRequestCandidatesItem } from './evalRankRequestCandidatesItem';
import type { EvalRankRequestVacanciesItem } from './evalRankRequestVacanciesItem';

export interface EvalRankRequest {
  /**
     * @minimum 1
     * @maximum 100
     */
  top_k?: number;
  /**
     * @minItems 1
     * @maxItems 100
     */
  vacancies: EvalRankRequestVacanciesItem[];
  /**
     * @minItems 1
     * @maxItems 2000
     */
  candidates: EvalRankRequestCandidatesItem[];
}
