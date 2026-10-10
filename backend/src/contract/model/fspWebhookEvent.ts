/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FspAchievement } from './fspAchievement.js';
import type { FspWebhookEventEvent } from './fspWebhookEventEvent.js';

export interface FspWebhookEvent {
  event: FspWebhookEventEvent;
  fsp_id: string;
  occurred_at: string;
  achievement: FspAchievement;
}
