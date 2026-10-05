/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { PageMeta } from './pageMeta';
import type { SearchResultItem } from './searchResultItem';

export type SearchResults = PageMeta & {
  search_id: string;
  /** @minimum 1 */
  version: number;
  generated_at: string;
  items: SearchResultItem[];
};
