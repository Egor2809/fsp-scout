/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SearchFilters } from './searchFilters';

export interface SearchVersion {
  /** @minimum 1 */
  version: number;
  created_at: string;
  /** Что изменилось относительно предыдущей версии */
  label: string;
  filters: SearchFilters;
  /** @minimum 0 */
  results_total: number;
}
