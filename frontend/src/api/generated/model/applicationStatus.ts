/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];


export const ApplicationStatus = {
  submitted: 'submitted',
  viewed: 'viewed',
  interview: 'interview',
  offer: 'offer',
  hired: 'hired',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
} as const;
