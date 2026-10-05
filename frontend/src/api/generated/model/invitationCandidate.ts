/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Category } from './category';

export interface InvitationCandidate {
  id: string;
  alias: string;
  category: Category | null;
  /** @nullable */
  percentile: number | null;
}
