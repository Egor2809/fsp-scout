/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FspDiscipline } from './fspDiscipline';
import type { FspFormat } from './fspFormat';
import type { FspLevel } from './fspLevel';
import type { FspResult } from './fspResult';

export interface FspAchievement {
  id: string;
  event_id: string;
  title: string;
  date: string;
  level: FspLevel;
  discipline: FspDiscipline;
  format: FspFormat;
  /** @nullable */
  team: string | null;
  /** @nullable */
  role: string | null;
  /**
     * @minimum 1
     * @nullable
     */
  place: number | null;
  /**
     * @minimum 1
     * @nullable
     */
  participants_total: number | null;
  /**
     * @minimum 1
     * @maximum 99
     * @nullable
     */
  percentile: number | null;
  result: FspResult;
  /**
     * Спортивный разряд
     * @nullable
     */
  sport_rank: string | null;
  /** @nullable */
  certificate_url: string | null;
  /** Подпись реестра ФСП проверена */
  verified: boolean;
}
