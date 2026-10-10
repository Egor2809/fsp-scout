/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Category } from './category.js';

export interface ProfileVerification {
  valid: boolean;
  full_name: string;
  category: Category | null;
  /** @nullable */
  percentile: number | null;
  /** @nullable */
  confirmed_at: string | null;
  fsp_achievements_count: number;
  issued_at: string;
}
