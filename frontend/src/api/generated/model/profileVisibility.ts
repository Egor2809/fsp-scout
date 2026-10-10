/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * visible — в выдаче; hidden_no_grade — нет подтверждённого грейда; hidden_no_consent — нет согласия profile_visibility; hidden_by_candidate — кандидат «не ищу» и скрыл профиль
 */
export type ProfileVisibility = typeof ProfileVisibility[keyof typeof ProfileVisibility];


export const ProfileVisibility = {
  visible: 'visible',
  hidden_no_grade: 'hidden_no_grade',
  hidden_no_consent: 'hidden_no_consent',
  hidden_by_candidate: 'hidden_by_candidate',
} as const;
