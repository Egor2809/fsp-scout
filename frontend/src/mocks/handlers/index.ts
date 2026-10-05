import { assessmentHandlers } from './assessment'
import { employerHandlers } from './employer'
import { invitationHandlers } from './invitations'
import { meHandlers } from './me'
import { vacancyHandlers } from './vacancies'

/** Ручные stateful-обработчики (реалистичные русские данные) покрывают весь контракт. */
export const statefulHandlers = [...meHandlers, ...assessmentHandlers, ...employerHandlers, ...invitationHandlers, ...vacancyHandlers]

/**
 * В браузере — только ручные обработчики: сгенерированные orval-моки матчат пути вида «звёздочка + /needs/:id»
 * и перехватывают модули Vite (/src/api/generated/endpoints/needs/needs.ts). Ручные покрывают весь контракт (см. p0-flow.test).
 */
export const handlers = statefulHandlers
