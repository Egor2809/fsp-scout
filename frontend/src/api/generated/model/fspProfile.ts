/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FspAchievement } from './fspAchievement';
import type { FspIndexComponent } from './fspIndexComponent';

export interface FspProfile {
  linked: boolean;
  /** @nullable */
  fsp_id: string | null;
  /** @nullable */
  verified_at: string | null;
  /** `false` — нейтральное состояние «Нет истории ФСП» (бонус 0, без штрафа) */
  has_history: boolean;
  /**
     * ФСП-индекс
     * @minimum 0
     * @maximum 100
     */
  index: number;
  /**
     * Бонус к силе профиля
     * @minimum 0
     * @maximum 15
     */
  bonus: number;
  components: FspIndexComponent[];
  achievements: FspAchievement[];
}
