/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SearchFilters } from './searchFilters.js';

export interface SearchRefine {
  filters: SearchFilters;
  /**
     * Подпись версии, по умолчанию сервер формирует из разницы фильтров
     * @maxLength 80
     */
  label?: string;
}
