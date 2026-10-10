/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type OnboardingStep = typeof OnboardingStep[keyof typeof OnboardingStep];


export const OnboardingStep = {
  consents: 'consents',
  survey: 'survey',
  grade: 'grade',
  test: 'test',
  done: 'done',
} as const;
