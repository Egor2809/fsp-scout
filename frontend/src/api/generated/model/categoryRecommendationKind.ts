/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Основная или соседняя категория
 */
export type CategoryRecommendationKind = typeof CategoryRecommendationKind[keyof typeof CategoryRecommendationKind];


export const CategoryRecommendationKind = {
  primary: 'primary',
  adjacent: 'adjacent',
} as const;
