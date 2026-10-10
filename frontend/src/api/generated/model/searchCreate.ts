/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SearchFilters } from './searchFilters';

export interface SearchCreate {
  /** @nullable */
  need_id?: string | null;
  /** @maxLength 120 */
  title?: string;
  filters: SearchFilters;
}
