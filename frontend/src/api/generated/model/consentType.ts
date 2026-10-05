/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Обработка ПДн / показ профиля работодателям / получение данных ФСП
 */
export type ConsentType = typeof ConsentType[keyof typeof ConsentType];


export const ConsentType = {
  personal_data: 'personal_data',
  profile_visibility: 'profile_visibility',
  fsp_data: 'fsp_data',
} as const;
