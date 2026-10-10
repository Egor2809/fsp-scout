/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий
 */
export interface CompanyTrust {
  /** @minimum 0 */
  invitations_90d: number;
  /**
     * @minimum 0
     * @maximum 1
     */
  acceptance_rate: number;
  /** @minimum 0 */
  withdrawn_after_accept: number;
}
