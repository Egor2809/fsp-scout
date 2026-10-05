import { getScoutAPIMock } from '../generated'
import { assessmentHandlers } from './assessment'
import { employerHandlers } from './employer'
import { invitationHandlers } from './invitations'
import { meHandlers } from './me'
import { vacancyHandlers } from './vacancies'

/** Ручные stateful-обработчики (реалистичные русские данные) покрывают весь контракт. */
export const statefulHandlers = [...meHandlers, ...assessmentHandlers, ...employerHandlers, ...invitationHandlers, ...vacancyHandlers]

/** Сгенерированные orval обработчики — запасной вариант, если ручного нет. */
export const handlers = [...statefulHandlers, ...getScoutAPIMock()]
