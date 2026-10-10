/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateCard } from './candidateCard';
import type { FspAchievement } from './fspAchievement';
import type { MatchExplanation } from './matchExplanation';

export type CandidateDetail = CandidateCard & ({
  /** Объяснение из подборки (если передан `search_id`) */
  explanation: MatchExplanation | null;
  /** Достижения ФСП (пусто, если скрыты или нет) */
  achievements: FspAchievement[];
});
