/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateCard } from './candidateCard';
import type { MatchExplanation } from './matchExplanation';

export interface SearchResultItem {
  /** @minimum 1 */
  rank: number;
  candidate: CandidateCard;
  explanation: MatchExplanation;
  shortlisted: boolean;
}
