/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { InvitationQuota } from './invitationQuota';

export interface InvitationPrecheck {
  can_send: boolean;
  /** `false` — «вилка ниже ожиданий кандидата», без цифры порога */
  salary_ok: boolean;
  already_invited: boolean;
  /** `false` — кандидат не ищет работу или скрыт */
  candidate_available: boolean;
  quota: InvitationQuota;
}
