/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Победитель / призёр / финалист / участник
 */
export type FspResult = typeof FspResult[keyof typeof FspResult];


export const FspResult = {
  winner: 'winner',
  prize_winner: 'prize_winner',
  finalist: 'finalist',
  participant: 'participant',
} as const;
