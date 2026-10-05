/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type FactorKind = typeof FactorKind[keyof typeof FactorKind];


export const FactorKind = {
  skills_coverage: 'skills_coverage',
  confirmed_skills: 'confirmed_skills',
  semantic: 'semantic',
  industry: 'industry',
  conditions: 'conditions',
  percentile: 'percentile',
  fsp: 'fsp',
  tasks: 'tasks',
  completeness: 'completeness',
  missing_skill: 'missing_skill',
  penalty: 'penalty',
} as const;
