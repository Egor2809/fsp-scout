/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Ищу активно / открыт к предложениям / не ищу
 */
export type Availability = typeof Availability[keyof typeof Availability];


export const Availability = {
  active: 'active',
  open: 'open',
  not_looking: 'not_looking',
} as const;
