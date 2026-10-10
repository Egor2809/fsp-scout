/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export interface InvitationQuota {
  /**
     * Итоговый лимит на неделю (база + бонус − штраф, не меньше 1)
     * @minimum 0
     */
  limit: number;
  /** @minimum 0 */
  used: number;
  /** @minimum 0 */
  remaining: number;
  period_start: string;
  period_end: string;
  /**
     * Штраф за отзыв приглашений после согласия кандидата (2 за каждый)
     * @minimum 0
     */
  penalty?: number;
  /**
     * Доля принятых инвайтов за 90 дней
     * @minimum 0
     * @maximum 1
     */
  acceptance_rate: number;
  /**
     * Прибавка к базовой квоте за долю принятых
     * @minimum 0
     */
  bonus: number;
}
