/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Category } from './category.js';

export interface ShortlistEntry {
  candidate_id: string;
  alias: string;
  category: Category | null;
  added_at: string;
  /** @minimum 1 */
  added_in_version: number;
}
