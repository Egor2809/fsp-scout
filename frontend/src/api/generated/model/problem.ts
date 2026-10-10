/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ConsentType } from './consentType';
import type { FieldError } from './fieldError';
import type { InvitationQuota } from './invitationQuota';
import type { ProblemCode } from './problemCode';

/**
 * RFC 9457 Problem Details. Допускаются дополнительные поля-расширения.
 */
export interface Problem {
  /** URI типа проблемы */
  type: string;
  /** Короткое описание для человека (на русском) */
  title: string;
  /**
     * @minimum 400
     * @maximum 599
     */
  status: number;
  /** Подробности конкретного случая (на русском, можно показывать пользователю) */
  detail?: string;
  instance?: string;
  code: ProblemCode;
  /** Ошибки по полям (для `validation_error`, `salary_range_invalid`) */
  errors?: FieldError[];
  /** Для `retake_locked` — когда станет доступно */
  available_at?: string;
  /** Для `consent_required` */
  consent_types?: ConsentType[];
  quota?: InvitationQuota;
  /** ID запроса для поддержки */
  trace_id?: string;
  [key: string]: unknown;
 }
