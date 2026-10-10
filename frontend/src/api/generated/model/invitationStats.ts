/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { InvitationStatsDeclineReasonsItem } from './invitationStatsDeclineReasonsItem';
import type { InvitationStatsFunnel } from './invitationStatsFunnel';

export interface InvitationStats {
  days: number;
  funnel: InvitationStatsFunnel;
  decline_reasons: InvitationStatsDeclineReasonsItem[];
  /**
     * @minimum 0
     * @maximum 1
     */
  acceptance_rate: number;
  /** @nullable */
  median_response_hours: number | null;
}
