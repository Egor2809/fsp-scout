/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type InvitationSourceType = typeof InvitationSourceType[keyof typeof InvitationSourceType];


export const InvitationSourceType = {
  search: 'search',
  bank: 'bank',
  task_submission: 'task_submission',
  vacancy: 'vacancy',
} as const;
