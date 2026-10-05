/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type ApplicationStatusUpdateStatus = typeof ApplicationStatusUpdateStatus[keyof typeof ApplicationStatusUpdateStatus];


export const ApplicationStatusUpdateStatus = {
  viewed: 'viewed',
  interview: 'interview',
  offer: 'offer',
  hired: 'hired',
  rejected: 'rejected',
} as const;
