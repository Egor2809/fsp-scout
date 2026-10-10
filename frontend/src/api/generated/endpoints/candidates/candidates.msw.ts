/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import {
  faker
} from '@faker-js/faker/locale/ru';

import {
  HttpResponse,
  http
} from 'msw';
import type {
  RequestHandlerOptions
} from 'msw';

import {
  ApplicationStatus,
  Availability,
  ContactChannel,
  DisclosureReason,
  FactorKind,
  FspDiscipline,
  FspFormat,
  FspLevel,
  FspResult,
  Grade,
  Industry,
  InvitationStatus,
  Polarity,
  SkillLevel,
  SkillSource,
  Specialization,
  WorkFormat
} from '../../model';
import type {
  CandidateContacts,
  CandidateDetail,
  CandidatePage,
  Category,
  FspAchievement,
  FspSummary,
  MatchExplanation,
  SalaryRange
} from '../../model';


export const getListCandidatesResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getListCandidatesResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getListCandidatesResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getListCandidatesResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 15, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getListCandidatesResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getListCandidatesResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getListCandidatesResponseMock = (): CandidatePage => ({...{total: faker.number.int({min: 0}), page: faker.number.int({min: 1}), page_size: faker.number.int({min: 1})},...{items: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getListCandidatesResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getListCandidatesResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getListCandidatesResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getListCandidatesResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}}))},})

export const getGetCandidateResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getGetCandidateResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getGetCandidateResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getGetCandidateResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 15, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getGetCandidateResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getGetCandidateResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getGetCandidateResponseMatchExplanationMock = (overrideResponse: Partial<MatchExplanation> = {}): MatchExplanation => ({...{score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), fit: faker.number.float({min: 0, max: 100, fractionDigits: 2}), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 3}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"})), factors: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))}, ...overrideResponse});

export const getGetCandidateResponseMock = (): CandidateDetail => ({...{id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getGetCandidateResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getGetCandidateResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getGetCandidateResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getGetCandidateResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}},...{explanation: faker.helpers.arrayElement([{...getGetCandidateResponseMatchExplanationMock()},null,]), achievements: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}))},})


export const getListCandidatesMockHandler = (overrideResponse?: CandidatePage | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<CandidatePage> | CandidatePage), options?: RequestHandlerOptions) => {
  return http.get('*/candidates', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListCandidatesResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetCandidateMockHandler = (overrideResponse?: CandidateDetail | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<CandidateDetail> | CandidateDetail), options?: RequestHandlerOptions) => {
  return http.get('*/candidates/:candidateId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetCandidateResponseMock(),
      { status: 200
      })
  }, options)
}
export const getCandidatesMock = () => [
  getListCandidatesMockHandler(),
  getGetCandidateMockHandler()
]
