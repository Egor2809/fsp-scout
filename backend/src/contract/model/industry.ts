/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type Industry = typeof Industry[keyof typeof Industry];


export const Industry = {
  fintech: 'fintech',
  ecom: 'ecom',
  gov: 'gov',
  telecom: 'telecom',
  gamedev: 'gamedev',
  edtech: 'edtech',
  medtech: 'medtech',
  manufacturing: 'manufacturing',
  other: 'other',
} as const;
