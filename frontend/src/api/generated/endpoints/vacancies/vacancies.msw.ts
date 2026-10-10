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
  CodeLanguage,
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
  VacancyStatus,
  WorkFormat
} from '../../model';
import type {
  Application,
  CandidateContacts,
  Category,
  EmployerApplication,
  FspAchievement,
  FspSummary,
  SalaryRange,
  TestBlueprint,
  Vacancy,
  VacancyPage
} from '../../model';


export const getListVacanciesResponseMock = (): VacancyPage => ({...{total: faker.number.int({min: 0}), page: faker.number.int({min: 1}), page_size: faker.number.int({min: 1})},...{items: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Middle Go-разработчик (платежи)", description: faker.string.alpha({length: {min: 10, max: 20}}), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), salary: {"from":250000,"to":320000}, status: faker.helpers.arrayElement(Object.values(VacancyStatus)), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', applications_count: faker.helpers.arrayElement([faker.number.int(), null]), my_application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus))},null,]), match: faker.helpers.arrayElement([{score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))},null,])}))},})

export const getCreateVacancyResponseMock = (overrideResponse: Partial<Extract<Vacancy, object>> = {}): Vacancy => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Middle Go-разработчик (платежи)", description: faker.string.alpha({length: {min: 10, max: 20}}), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), salary: {"from":250000,"to":320000}, status: faker.helpers.arrayElement(Object.values(VacancyStatus)), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', applications_count: faker.helpers.arrayElement([faker.number.int(), null]), my_application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus))},null,]), match: faker.helpers.arrayElement([{score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))},null,]), ...overrideResponse})

export const getGetVacancyResponseMock = (overrideResponse: Partial<Extract<Vacancy, object>> = {}): Vacancy => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Middle Go-разработчик (платежи)", description: faker.string.alpha({length: {min: 10, max: 20}}), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), salary: {"from":250000,"to":320000}, status: faker.helpers.arrayElement(Object.values(VacancyStatus)), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', applications_count: faker.helpers.arrayElement([faker.number.int(), null]), my_application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus))},null,]), match: faker.helpers.arrayElement([{score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))},null,]), ...overrideResponse})

export const getUpdateVacancyResponseMock = (overrideResponse: Partial<Extract<Vacancy, object>> = {}): Vacancy => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Middle Go-разработчик (платежи)", description: faker.string.alpha({length: {min: 10, max: 20}}), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), salary: {"from":250000,"to":320000}, status: faker.helpers.arrayElement(Object.values(VacancyStatus)), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', applications_count: faker.helpers.arrayElement([faker.number.int(), null]), my_application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus))},null,]), match: faker.helpers.arrayElement([{score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))},null,]), ...overrideResponse})

export const getApplyToVacancyResponseMock = (overrideResponse: Partial<Extract<Application, object>> = {}): Application => ({id: faker.string.uuid(), vacancy: {id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), cover_letter: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getListVacancyApplicationsResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getListVacancyApplicationsResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getListVacancyApplicationsResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getListVacancyApplicationsResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getListVacancyApplicationsResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getListVacancyApplicationsResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getListVacancyApplicationsResponseMock = (): EmployerApplication[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({...{id: faker.string.uuid(), vacancy: {id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), cover_letter: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}))},...{candidate: {id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getListVacancyApplicationsResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss','leak_suspected'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getListVacancyApplicationsResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getListVacancyApplicationsResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getListVacancyApplicationsResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}}, explanation: {score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), fit: faker.number.float({min: 0, max: 100, fractionDigits: 2}), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 3}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"})), factors: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))}},})))

export const getGetVacancyTestBlueprintResponseMock = (overrideResponse: Partial<Extract<TestBlueprint, object>> = {}): TestBlueprint => ({vacancy_id: faker.string.uuid(), vacancy_title: faker.string.alpha({length: {min: 10, max: 20}}), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), extracted_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill: {id: "go", name: "Go"}, weight: faker.number.float({min: 0, max: 1, fractionDigits: 2}), importance: faker.helpers.arrayElement(['must','nice'] as const)})), competencies: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({competency_id: faker.string.alpha({length: {min: 10, max: 20}}), name: "Go", share: 0.4, families_count: faker.number.int(), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"}))})), adaptive_items: {min: faker.number.int(), max: faker.number.int()}, practice: faker.helpers.arrayElement([{title: faker.string.alpha({length: {min: 10, max: 20}}), language: faker.helpers.arrayElement(Object.values(CodeLanguage))},null,]), generated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getListMyApplicationsResponseMock = (): Application[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), vacancy: {id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), cover_letter: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}))})))

export const getWithdrawApplicationResponseMock = (overrideResponse: Partial<Extract<Application, object>> = {}): Application => ({id: faker.string.uuid(), vacancy: {id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), cover_letter: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getUpdateApplicationStatusResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getUpdateApplicationStatusResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getUpdateApplicationStatusResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getUpdateApplicationStatusResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getUpdateApplicationStatusResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getUpdateApplicationStatusResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getUpdateApplicationStatusResponseMock = (): EmployerApplication => ({...{id: faker.string.uuid(), vacancy: {id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), cover_letter: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}))},...{candidate: {id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getUpdateApplicationStatusResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss','leak_suspected'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getUpdateApplicationStatusResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getUpdateApplicationStatusResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getUpdateApplicationStatusResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}}, explanation: {score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), fit: faker.number.float({min: 0, max: 100, fractionDigits: 2}), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 3}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"})), factors: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))}},})


export const getListVacanciesMockHandler = (overrideResponse?: VacancyPage | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<VacancyPage> | VacancyPage), options?: RequestHandlerOptions) => {
  return http.get('*/vacancies', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListVacanciesResponseMock(),
      { status: 200
      })
  }, options)
}

export const getCreateVacancyMockHandler = (overrideResponse?: Vacancy | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Vacancy> | Vacancy), options?: RequestHandlerOptions) => {
  return http.post('*/vacancies', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getCreateVacancyResponseMock(),
      { status: 201
      })
  }, options)
}

export const getGetVacancyMockHandler = (overrideResponse?: Vacancy | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Vacancy> | Vacancy), options?: RequestHandlerOptions) => {
  return http.get('*/vacancies/:vacancyId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetVacancyResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateVacancyMockHandler = (overrideResponse?: Vacancy | ((info: Parameters<Parameters<typeof http.put>[1]>[0]) => Promise<Vacancy> | Vacancy), options?: RequestHandlerOptions) => {
  return http.put('*/vacancies/:vacancyId', async (info: Parameters<Parameters<typeof http.put>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateVacancyResponseMock(),
      { status: 200
      })
  }, options)
}

export const getApplyToVacancyMockHandler = (overrideResponse?: Application | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Application> | Application), options?: RequestHandlerOptions) => {
  return http.post('*/vacancies/:vacancyId/apply', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getApplyToVacancyResponseMock(),
      { status: 201
      })
  }, options)
}

export const getListVacancyApplicationsMockHandler = (overrideResponse?: EmployerApplication[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<EmployerApplication[]> | EmployerApplication[]), options?: RequestHandlerOptions) => {
  return http.get('*/vacancies/:vacancyId/applications', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListVacancyApplicationsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetVacancyTestBlueprintMockHandler = (overrideResponse?: TestBlueprint | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TestBlueprint> | TestBlueprint), options?: RequestHandlerOptions) => {
  return http.get('*/vacancies/:vacancyId/test-blueprint', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetVacancyTestBlueprintResponseMock(),
      { status: 200
      })
  }, options)
}

export const getListMyApplicationsMockHandler = (overrideResponse?: Application[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Application[]> | Application[]), options?: RequestHandlerOptions) => {
  return http.get('*/me/applications', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListMyApplicationsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getWithdrawApplicationMockHandler = (overrideResponse?: Application | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Application> | Application), options?: RequestHandlerOptions) => {
  return http.post('*/applications/:applicationId/withdraw', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getWithdrawApplicationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateApplicationStatusMockHandler = (overrideResponse?: EmployerApplication | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<EmployerApplication> | EmployerApplication), options?: RequestHandlerOptions) => {
  return http.post('*/applications/:applicationId/status', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateApplicationStatusResponseMock(),
      { status: 200
      })
  }, options)
}
export const getVacanciesMock = () => [
  getListVacanciesMockHandler(),
  getCreateVacancyMockHandler(),
  getGetVacancyMockHandler(),
  getUpdateVacancyMockHandler(),
  getApplyToVacancyMockHandler(),
  getListVacancyApplicationsMockHandler(),
  getGetVacancyTestBlueprintMockHandler(),
  getListMyApplicationsMockHandler(),
  getWithdrawApplicationMockHandler(),
  getUpdateApplicationStatusMockHandler()
]
