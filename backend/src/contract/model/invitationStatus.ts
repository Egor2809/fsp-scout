/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];


export const InvitationStatus = {
  draft: 'draft',
  sent: 'sent',
  viewed: 'viewed',
  postponed: 'postponed',
  accepted: 'accepted',
  declined: 'declined',
  expired: 'expired',
  withdrawn: 'withdrawn',
  interview: 'interview',
  offer: 'offer',
  hired: 'hired',
  closed: 'closed',
} as const;
