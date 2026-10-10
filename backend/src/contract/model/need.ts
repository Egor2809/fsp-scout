/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ConfirmedNeed } from './confirmedNeed.js';
import type { ParsedNeed } from './parsedNeed.js';

export interface Need {
  id: string;
  raw_text: string;
  parsed: ParsedNeed;
  /** `null` — черновик, ещё не подтверждён */
  confirmed: ConfirmedNeed | null;
  created_at: string;
  updated_at: string;
}
