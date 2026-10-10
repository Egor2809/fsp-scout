/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FspAchievement } from './fspAchievement.js';
import type { FspLevel } from './fspLevel.js';

export interface FspSummary {
  has_history: boolean;
  /**
     * @minimum 0
     * @maximum 100
     */
  index: number;
  /**
     * @minimum 0
     * @maximum 30
     */
  bonus: number;
  /** @minimum 0 */
  achievements_count: number;
  top_achievement: FspAchievement | null;
  max_level: FspLevel | null;
}
