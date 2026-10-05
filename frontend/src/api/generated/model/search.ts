/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SearchVersion } from './searchVersion';
import type { ShortlistEntry } from './shortlistEntry';

export interface Search {
  id: string;
  /** @nullable */
  need_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  /** @minimum 1 */
  current_version: number;
  versions: SearchVersion[];
  /** Закреплён за подборкой, не теряется при смене версии */
  shortlist: ShortlistEntry[];
}
