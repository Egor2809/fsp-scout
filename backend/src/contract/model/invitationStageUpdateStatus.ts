/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type InvitationStageUpdateStatus = typeof InvitationStageUpdateStatus[keyof typeof InvitationStageUpdateStatus];


export const InvitationStageUpdateStatus = {
  interview: 'interview',
  offer: 'offer',
  hired: 'hired',
  closed: 'closed',
} as const;
