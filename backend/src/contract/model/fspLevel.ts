/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Региональный / всероссийский / международный
 */
export type FspLevel = typeof FspLevel[keyof typeof FspLevel];


export const FspLevel = {
  regional: 'regional',
  national: 'national',
  international: 'international',
} as const;
