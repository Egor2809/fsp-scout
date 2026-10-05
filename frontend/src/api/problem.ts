import type { Problem, ProblemCode } from './generated/model'

/** RFC 9457: тело ответа — Problem Details. */
export function isProblem(value: unknown): value is Problem {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.status === 'number' && typeof v.title === 'string' && typeof v.code === 'string'
}

const FALLBACK_TITLES: Record<number, string> = {
  400: 'Некорректный запрос',
  401: 'Требуется вход',
  403: 'Недостаточно прав',
  404: 'Не найдено',
  409: 'Конфликт состояния',
  413: 'Файл слишком большой',
  415: 'Неподдерживаемый формат файла',
  422: 'Проверьте поля',
  429: 'Слишком много запросов',
  500: 'Ошибка сервера',
  502: 'Сервер недоступен',
  503: 'Сервис временно недоступен',
}

const STATUS_CODES: Record<number, ProblemCode> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  413: 'file_too_large',
  415: 'unsupported_media_type',
  422: 'validation_error',
  429: 'rate_limited',
}

/** Ошибка API: всегда содержит Problem, фронтенд ветвится только по `code`. */
export class ApiError extends Error {
  readonly problem: Problem
  readonly isNetworkError: boolean

  constructor(problem: Problem, isNetworkError = false) {
    super(problem.detail ?? problem.title)
    this.name = 'ApiError'
    this.problem = problem
    this.isNetworkError = isNetworkError
  }

  get code(): ProblemCode {
    return this.problem.code
  }

  get status(): number {
    return this.problem.status
  }

  static fromStatus(status: number, statusText?: string): ApiError {
    return new ApiError({
      type: 'about:blank',
      title: FALLBACK_TITLES[status] ?? statusText ?? 'Ошибка',
      status,
      code: STATUS_CODES[status] ?? 'internal_error',
    })
  }

  static network(cause: unknown): ApiError {
    const error = new ApiError(
      {
        type: 'about:blank',
        title: 'Нет связи с сервером',
        status: 503,
        code: 'internal_error',
        detail: 'Проверьте подключение к интернету и попробуйте ещё раз.',
      },
      true,
    )
    error.cause = cause
    return error
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function hasProblemCode(error: unknown, code: ProblemCode): boolean {
  return isApiError(error) && error.code === code
}

/** Текст ошибки для пользователя. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) return error.problem.detail ?? error.problem.title
  if (error instanceof Error) return error.message
  return 'Что-то пошло не так. Попробуйте ещё раз.'
}

/** Ошибки по полям: JSON Pointer → текст. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || !error.problem.errors) return {}
  const map: Record<string, string> = {}
  for (const e of error.problem.errors) map[e.pointer] = e.detail
  return map
}
