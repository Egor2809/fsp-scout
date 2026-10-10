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
  Category,
  FspAchievement,
  FspSummary,
  SalaryRange,
  Search,
  SearchResults
} from '../../model';


export const getListSearchesResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getListSearchesResponseMock = (): Search[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), need_id: faker.helpers.arrayElement([faker.string.uuid(), null]), title: "Go-разработчик в платёжный сервис", created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', current_version: faker.number.int({min: 1}), versions: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({version: faker.number.int({min: 1}), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', label: "+ Kafka обязательно", filters: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), include_relocation: faker.datatype.boolean(), industries: faker.helpers.arrayElements(Object.values(Industry)), salary: {"from":250000,"to":320000}, fsp_only: faker.datatype.boolean(), fsp_level_min: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,]), availability: faker.helpers.arrayElements(['active','open'] as const)}, results_total: faker.number.int({min: 0})})), shortlist: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getListSearchesResponseCategoryMock()},null,]), added_at: faker.date.past().toISOString().slice(0, 19) + 'Z', added_in_version: faker.number.int({min: 1})}))})))

export const getCreateSearchResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getCreateSearchResponseMock = (overrideResponse: Partial<Extract<Search, object>> = {}): Search => ({id: faker.string.uuid(), need_id: faker.helpers.arrayElement([faker.string.uuid(), null]), title: "Go-разработчик в платёжный сервис", created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', current_version: faker.number.int({min: 1}), versions: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({version: faker.number.int({min: 1}), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', label: "+ Kafka обязательно", filters: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), include_relocation: faker.datatype.boolean(), industries: faker.helpers.arrayElements(Object.values(Industry)), salary: {"from":250000,"to":320000}, fsp_only: faker.datatype.boolean(), fsp_level_min: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,]), availability: faker.helpers.arrayElements(['active','open'] as const)}, results_total: faker.number.int({min: 0})})), shortlist: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getCreateSearchResponseCategoryMock()},null,]), added_at: faker.date.past().toISOString().slice(0, 19) + 'Z', added_in_version: faker.number.int({min: 1})})), ...overrideResponse})

export const getGetSearchResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getGetSearchResponseMock = (overrideResponse: Partial<Extract<Search, object>> = {}): Search => ({id: faker.string.uuid(), need_id: faker.helpers.arrayElement([faker.string.uuid(), null]), title: "Go-разработчик в платёжный сервис", created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', current_version: faker.number.int({min: 1}), versions: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({version: faker.number.int({min: 1}), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', label: "+ Kafka обязательно", filters: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), include_relocation: faker.datatype.boolean(), industries: faker.helpers.arrayElements(Object.values(Industry)), salary: {"from":250000,"to":320000}, fsp_only: faker.datatype.boolean(), fsp_level_min: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,]), availability: faker.helpers.arrayElements(['active','open'] as const)}, results_total: faker.number.int({min: 0})})), shortlist: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getGetSearchResponseCategoryMock()},null,]), added_at: faker.date.past().toISOString().slice(0, 19) + 'Z', added_in_version: faker.number.int({min: 1})})), ...overrideResponse})

export const getRefineSearchResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getRefineSearchResponseMock = (overrideResponse: Partial<Extract<Search, object>> = {}): Search => ({id: faker.string.uuid(), need_id: faker.helpers.arrayElement([faker.string.uuid(), null]), title: "Go-разработчик в платёжный сервис", created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', current_version: faker.number.int({min: 1}), versions: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({version: faker.number.int({min: 1}), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', label: "+ Kafka обязательно", filters: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), include_relocation: faker.datatype.boolean(), industries: faker.helpers.arrayElements(Object.values(Industry)), salary: {"from":250000,"to":320000}, fsp_only: faker.datatype.boolean(), fsp_level_min: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,]), availability: faker.helpers.arrayElements(['active','open'] as const)}, results_total: faker.number.int({min: 0})})), shortlist: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getRefineSearchResponseCategoryMock()},null,]), added_at: faker.date.past().toISOString().slice(0, 19) + 'Z', added_in_version: faker.number.int({min: 1})})), ...overrideResponse})

export const getGetSearchResultsResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getGetSearchResultsResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getGetSearchResultsResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getGetSearchResultsResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getGetSearchResultsResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getGetSearchResultsResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getGetSearchResultsResponseMock = (): SearchResults => ({...{total: faker.number.int({min: 0}), page: faker.number.int({min: 1}), page_size: faker.number.int({min: 1})},...{search_id: faker.string.uuid(), version: faker.number.int({min: 1}), generated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', items: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({rank: faker.number.int({min: 1}), candidate: {id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getGetSearchResultsResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss','leak_suspected'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getGetSearchResultsResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getGetSearchResultsResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getGetSearchResultsResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}}, explanation: {score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), fit: faker.number.float({min: 0, max: 100, fractionDigits: 2}), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 3}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"})), factors: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))}, shortlisted: faker.datatype.boolean()}))},})

export const getAddToShortlistResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getAddToShortlistResponseMock = (overrideResponse: Partial<Extract<Search, object>> = {}): Search => ({id: faker.string.uuid(), need_id: faker.helpers.arrayElement([faker.string.uuid(), null]), title: "Go-разработчик в платёжный сервис", created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', current_version: faker.number.int({min: 1}), versions: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({version: faker.number.int({min: 1}), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', label: "+ Kafka обязательно", filters: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), include_relocation: faker.datatype.boolean(), industries: faker.helpers.arrayElements(Object.values(Industry)), salary: {"from":250000,"to":320000}, fsp_only: faker.datatype.boolean(), fsp_level_min: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,]), availability: faker.helpers.arrayElements(['active','open'] as const)}, results_total: faker.number.int({min: 0})})), shortlist: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getAddToShortlistResponseCategoryMock()},null,]), added_at: faker.date.past().toISOString().slice(0, 19) + 'Z', added_in_version: faker.number.int({min: 1})})), ...overrideResponse})

export const getRemoveFromShortlistResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getRemoveFromShortlistResponseMock = (overrideResponse: Partial<Extract<Search, object>> = {}): Search => ({id: faker.string.uuid(), need_id: faker.helpers.arrayElement([faker.string.uuid(), null]), title: "Go-разработчик в платёжный сервис", created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', current_version: faker.number.int({min: 1}), versions: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({version: faker.number.int({min: 1}), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', label: "+ Kafka обязательно", filters: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 15}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), include_relocation: faker.datatype.boolean(), industries: faker.helpers.arrayElements(Object.values(Industry)), salary: {"from":250000,"to":320000}, fsp_only: faker.datatype.boolean(), fsp_level_min: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,]), availability: faker.helpers.arrayElements(['active','open'] as const)}, results_total: faker.number.int({min: 0})})), shortlist: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getRemoveFromShortlistResponseCategoryMock()},null,]), added_at: faker.date.past().toISOString().slice(0, 19) + 'Z', added_in_version: faker.number.int({min: 1})})), ...overrideResponse})


export const getListSearchesMockHandler = (overrideResponse?: Search[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Search[]> | Search[]), options?: RequestHandlerOptions) => {
  return http.get('*/searches', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListSearchesResponseMock(),
      { status: 200
      })
  }, options)
}

export const getCreateSearchMockHandler = (overrideResponse?: Search | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Search> | Search), options?: RequestHandlerOptions) => {
  return http.post('*/searches', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getCreateSearchResponseMock(),
      { status: 201
      })
  }, options)
}

export const getGetSearchMockHandler = (overrideResponse?: Search | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Search> | Search), options?: RequestHandlerOptions) => {
  return http.get('*/searches/:searchId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetSearchResponseMock(),
      { status: 200
      })
  }, options)
}

export const getRefineSearchMockHandler = (overrideResponse?: Search | ((info: Parameters<Parameters<typeof http.patch>[1]>[0]) => Promise<Search> | Search), options?: RequestHandlerOptions) => {
  return http.patch('*/searches/:searchId', async (info: Parameters<Parameters<typeof http.patch>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getRefineSearchResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetSearchResultsMockHandler = (overrideResponse?: SearchResults | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<SearchResults> | SearchResults), options?: RequestHandlerOptions) => {
  return http.get('*/searches/:searchId/results', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetSearchResultsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getAddToShortlistMockHandler = (overrideResponse?: Search | ((info: Parameters<Parameters<typeof http.put>[1]>[0]) => Promise<Search> | Search), options?: RequestHandlerOptions) => {
  return http.put('*/searches/:searchId/shortlist/:candidateId', async (info: Parameters<Parameters<typeof http.put>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getAddToShortlistResponseMock(),
      { status: 200
      })
  }, options)
}

export const getRemoveFromShortlistMockHandler = (overrideResponse?: Search | ((info: Parameters<Parameters<typeof http.delete>[1]>[0]) => Promise<Search> | Search), options?: RequestHandlerOptions) => {
  return http.delete('*/searches/:searchId/shortlist/:candidateId', async (info: Parameters<Parameters<typeof http.delete>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getRemoveFromShortlistResponseMock(),
      { status: 200
      })
  }, options)
}
export const getSearchesMock = () => [
  getListSearchesMockHandler(),
  getCreateSearchMockHandler(),
  getGetSearchMockHandler(),
  getRefineSearchMockHandler(),
  getGetSearchResultsMockHandler(),
  getAddToShortlistMockHandler(),
  getRemoveFromShortlistMockHandler()
]
