/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

/**
 * Машинный код ошибки
 */
export type ProblemCode = typeof ProblemCode[keyof typeof ProblemCode];


export const ProblemCode = {
  bad_request: 'bad_request',
  validation_error: 'validation_error',
  salary_range_invalid: 'salary_range_invalid',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  consent_required: 'consent_required',
  not_found: 'not_found',
  conflict: 'conflict',
  salary_below_floor: 'salary_below_floor',
  quota_exceeded: 'quota_exceeded',
  already_invited: 'already_invited',
  candidate_unavailable: 'candidate_unavailable',
  invitation_not_actionable: 'invitation_not_actionable',
  retake_locked: 'retake_locked',
  test_in_progress: 'test_in_progress',
  test_not_active: 'test_not_active',
  survey_required: 'survey_required',
  need_not_confirmed: 'need_not_confirmed',
  already_applied: 'already_applied',
  vacancy_closed: 'vacancy_closed',
  task_already_submitted: 'task_already_submitted',
  fsp_not_found: 'fsp_not_found',
  fsp_already_linked: 'fsp_already_linked',
  grade_unconfirmed: 'grade_unconfirmed',
  file_too_large: 'file_too_large',
  unsupported_media_type: 'unsupported_media_type',
  rate_limited: 'rate_limited',
  internal_error: 'internal_error',
} as const;
