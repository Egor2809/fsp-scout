/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания
 */
export type SkillSource = typeof SkillSource[keyof typeof SkillSource];


export const SkillSource = {
  self: 'self',
  resume: 'resume',
  test: 'test',
  fsp: 'fsp',
  task: 'task',
} as const;
