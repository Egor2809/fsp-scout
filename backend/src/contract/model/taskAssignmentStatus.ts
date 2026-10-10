/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type TaskAssignmentStatus = typeof TaskAssignmentStatus[keyof typeof TaskAssignmentStatus];


export const TaskAssignmentStatus = {
  assigned: 'assigned',
  submitted: 'submitted',
  reviewed: 'reviewed',
  expired: 'expired',
} as const;
