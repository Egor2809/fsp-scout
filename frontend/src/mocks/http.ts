import { delay, http, HttpResponse, type PathParams } from 'msw'
import type { ZodType } from 'zod'
import type { FieldError, Problem, ProblemCode, Role } from '@/api/generated/model'
import { decodeJwtPayload, roleFromClaims } from '@/auth/jwt'
import { loadDb, saveDb } from './db/store'
import type { CandidateRec, MockDb, UserRec } from './db/types'

/** Все мок-маршруты живут под /api/v1 (как servers.url в контракте). */
export const API = '*/api/v1'

const PROBLEM_SLUG: Partial<Record<ProblemCode, string>> = {}

function problemType(code: ProblemCode): string {
  return `https://scout.local/problems/${PROBLEM_SLUG[code] ?? code.replace(/_/g, '-')}`
}

export function problem(
  status: number,
  code: ProblemCode,
  title: string,
  detail?: string,
  extra: Partial<Problem> = {},
): Response {
  const body: Problem = { type: problemType(code), title, status, code, ...(detail ? { detail } : {}), ...extra }
  return HttpResponse.json(body, { status, headers: { 'Content-Type': 'application/problem+json' } })
}

export const notFound = (what = 'Объект') => problem(404, 'not_found', 'Не найдено', `${what} не найден или недоступен.`)

export function validationProblem(errors: FieldError[], code: ProblemCode = 'validation_error'): Response {
  return problem(422, code, code === 'salary_range_invalid' ? 'Некорректная вилка' : 'Проверьте поля', errors[0]?.detail, { errors })
}

export function json<T>(data: T, status = 200): Response {
  return HttpResponse.json(data as never, { status })
}

/** Задержка «сети» — видны скелетоны. В тестах её можно выключить. */
let latency: [number, number] = [120, 380]
export function setMockLatency(range: [number, number]): void {
  latency = range
}

export interface Ctx {
  db: MockDb
  user: UserRec
  now: Date
}

export interface CandidateCtx extends Ctx {
  candidate: CandidateRec
}

export interface EmployerCtx extends Ctx {
  companyId: string
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface HandlerArgs<C> {
  ctx: C
  params: PathParams
  url: URL
  body: unknown
  form: FormData | null
  request: Request
}

function provisionUser(db: MockDb, claims: NonNullable<ReturnType<typeof decodeJwtPayload>>, role: Role, now: Date): UserRec {
  const nowIso = now.toISOString()
  const user: UserRec = {
    id: claims.sub,
    role,
    email: claims.email,
    displayName: claims.name || claims.email,
    candidateId: null,
    companyId: null,
    createdAt: nowIso,
  }
  if (role === 'candidate') {
    const candidate: CandidateRec = {
      id: crypto.randomUUID(),
      userId: user.id,
      fullName: user.displayName,
      email: user.email,
      phone: null,
      telegram: null,
      preferredChannel: 'email',
      city: null,
      relocation: false,
      about: null,
      specialization: null,
      standing: null,
      theta: null,
      se: null,
      experienceYears: 0,
      experience: [],
      skills: [],
      industries: [],
      workFormats: [],
      salaryExpectation: null,
      availability: 'active',
      privacy: { salaryFloor: null, hiddenCompanyIds: [], showFsp: true, showCompanyNames: false, showCity: true },
      consents: [],
      fsp: { linked: false, fspId: null, verifiedAt: null, achievements: [] },
      taskSignal: { fresh: false, solvedCount: 0, lastSolvedAt: null },
      lastActiveAt: nowIso,
      gradeChangedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    db.candidates.push(candidate)
    user.candidateId = candidate.id
  }
  if (role === 'employer') {
    const companyId = crypto.randomUUID()
    db.companies.push({
      id: companyId,
      name: 'Новая компания',
      industry: 'other',
      description: 'Расскажите о компании, чтобы кандидаты понимали контекст предложений.',
      website: null,
      city: null,
      size: '1-50',
      inn: null,
      contact_email: user.email,
      contact_phone: null,
      verified: false,
      created_at: nowIso,
      quotaBase: 20,
    })
    user.companyId = companyId
  }
  db.users.push(user)
  return user
}

async function readBody(request: Request): Promise<{ body: unknown; form: FormData | null }> {
  if (request.method === 'GET' || request.method === 'HEAD') return { body: null, form: null }
  const type = request.headers.get('Content-Type') ?? ''
  if (type.includes('multipart/form-data')) {
    try {
      return { body: null, form: await request.formData() }
    } catch {
      return { body: null, form: null }
    }
  }
  const text = await request.text()
  if (!text) return { body: null, form: null }
  try {
    return { body: JSON.parse(text) as unknown, form: null }
  } catch {
    return { body: Symbol.for('invalid-json'), form: null }
  }
}

type RoleSpec = Role[] | 'public' | 'any'

function makeRoute<C>(
  method: Method,
  path: string,
  roles: RoleSpec,
  resolve: (ctx: Ctx) => C | Response,
  handler: (args: HandlerArgs<C>) => Response,
) {
  return http[method](`${API}${path}`, async ({ request, params }) => {
    const { body, form } = await readBody(request)
    if (latency[1] > 0) await delay(latency[0] + Math.random() * (latency[1] - latency[0]))
    if (body === Symbol.for('invalid-json')) return problem(400, 'bad_request', 'Некорректный JSON')
    const url = new URL(request.url)
    const now = new Date()
    const db = loadDb(now)

    let user: UserRec | null = null
    if (roles !== 'public') {
      const header = request.headers.get('Authorization') ?? ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : ''
      const claims = token ? decodeJwtPayload(token) : null
      const role = claims ? roleFromClaims(claims) : null
      if (!claims || !role) return problem(401, 'unauthorized', 'Требуется вход', 'Войдите, чтобы продолжить.')
      user = db.users.find((u) => u.id === claims.sub) ?? provisionUser(db, claims, role, now)
      if (roles !== 'any' && !roles.includes(user.role)) {
        saveDb(db)
        return problem(403, 'forbidden', 'Недостаточно прав', 'Это действие недоступно для вашей роли.')
      }
    }
    const base: Ctx = { db, user: user as UserRec, now }
    const ctx = resolve(base)
    if (ctx instanceof Response) return ctx
    try {
      const response = handler({ ctx, params, url, body, form, request })
      saveDb(db)
      return response
    } catch (error) {
      console.error('[mock] handler error', error)
      return problem(500, 'internal_error', 'Ошибка сервера', 'Внутренняя ошибка мок-сервера.')
    }
  })
}

export const route = {
  public: (method: Method, path: string, handler: (args: HandlerArgs<Ctx>) => Response) =>
    makeRoute(method, path, 'public', (ctx) => ctx, handler),
  any: (method: Method, path: string, handler: (args: HandlerArgs<Ctx>) => Response) =>
    makeRoute(method, path, 'any', (ctx) => ctx, handler),
  candidate: (method: Method, path: string, handler: (args: HandlerArgs<CandidateCtx>) => Response) =>
    makeRoute<CandidateCtx>(method, path, ['candidate'], (ctx) => {
      const candidate = ctx.db.candidates.find((c) => c.id === ctx.user.candidateId)
      if (!candidate) return problem(403, 'forbidden', 'Недостаточно прав', 'Профиль кандидата не найден.')
      candidate.lastActiveAt = ctx.now.toISOString()
      return { ...ctx, candidate }
    }, handler),
  employer: (method: Method, path: string, handler: (args: HandlerArgs<EmployerCtx>) => Response) =>
    makeRoute<EmployerCtx>(method, path, ['employer'], (ctx) => {
      if (!ctx.user.companyId) return problem(403, 'forbidden', 'Недостаточно прав', 'Компания не найдена.')
      return { ...ctx, companyId: ctx.user.companyId }
    }, handler),
  roles: (roles: Role[], method: Method, path: string, handler: (args: HandlerArgs<Ctx>) => Response) =>
    makeRoute(method, path, roles, (ctx) => ctx, handler),
}

/** Валидация тела запроса по zod-схеме из контракта. */
export function parseBody<T>(schema: ZodType<T>, body: unknown): { ok: true; data: T } | { ok: false; response: Response } {
  const result = schema.safeParse(body ?? {})
  if (result.success) return { ok: true, data: result.data }
  const errors: FieldError[] = result.error.issues.map((issue) => ({
    pointer: `/${issue.path.map(String).join('/')}`,
    detail: humanizeIssue(issue.message, issue.code),
  }))
  return { ok: false, response: validationProblem(errors) }
}

function humanizeIssue(message: string, code: string): string {
  if (code === 'invalid_type') return 'Обязательное поле или неверный тип'
  if (code === 'too_small') return 'Слишком короткое значение или меньше минимума'
  if (code === 'too_big') return 'Слишком длинное значение или больше максимума'
  if (code === 'invalid_format') return 'Неверный формат'
  if (code === 'invalid_value') return 'Недопустимое значение'
  return message
}

/** Правило вилки, которое zod-схема не выражает: from ≤ to. */
export function salaryRangeProblem(salary: { from: number; to: number }, pointer = '/salary'): Response | null {
  if (salary.from > salary.to) {
    return validationProblem([{ pointer: `${pointer}/to`, detail: 'Верхняя граница должна быть не меньше нижней' }], 'salary_range_invalid')
  }
  return null
}

export function pageParams(url: URL): { page: number; pageSize: number } {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('page_size') ?? '20') || 20))
  return { page, pageSize }
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, page_size: pageSize }
}
