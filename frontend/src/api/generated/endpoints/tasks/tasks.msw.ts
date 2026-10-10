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
  FspDiscipline,
  FspFormat,
  FspLevel,
  FspResult,
  Grade,
  Industry,
  InvitationStatus,
  SkillLevel,
  SkillSource,
  Specialization,
  TaskAssignmentStatus,
  TaskKind,
  WorkFormat
} from '../../model';
import type {
  CandidateContacts,
  Category,
  EmployerTaskSubmission,
  FspAchievement,
  FspSummary,
  RegularTask,
  SalaryRange,
  TaskAssignment,
  TaskSubmission
} from '../../model';


export const getListMyTasksResponseTaskSubmissionMock = (overrideResponse: Partial<TaskSubmission> = {}): TaskSubmission => ({...{id: faker.string.uuid(), task_id: faker.string.uuid(), submitted_at: faker.date.past().toISOString().slice(0, 19) + 'Z', answer_text: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), status: faker.helpers.arrayElement(['pending','scored'] as const), llm_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), final_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), fresh_signal: faker.datatype.boolean(), feedback: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}, ...overrideResponse});

export const getListMyTasksResponseMock = (): TaskAssignment[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({task: {id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Идемпотентный обработчик платежа", description: faker.string.alpha({length: {min: 10, max: 20}}), kind: faker.helpers.arrayElement(Object.values(TaskKind)), specializations: faker.helpers.arrayElements(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), time_limit_min: faker.number.int({min: 5, max: 30}), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), starter_code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), rubric: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({criterion: "Корректность на граничных случаях", weight: faker.number.float({min: 0, max: 1, fractionDigits: 2})})), status: faker.helpers.arrayElement(['active','closed'] as const), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', assigned_count: faker.helpers.arrayElement([faker.number.int(), null]), submissions_count: faker.helpers.arrayElement([faker.number.int(), null])}, status: faker.helpers.arrayElement(Object.values(TaskAssignmentStatus)), assigned_at: faker.date.past().toISOString().slice(0, 19) + 'Z', due_at: faker.date.past().toISOString().slice(0, 19) + 'Z', submission: faker.helpers.arrayElement([{...getListMyTasksResponseTaskSubmissionMock()},null,])})))

export const getGetMyTaskResponseTaskSubmissionMock = (overrideResponse: Partial<TaskSubmission> = {}): TaskSubmission => ({...{id: faker.string.uuid(), task_id: faker.string.uuid(), submitted_at: faker.date.past().toISOString().slice(0, 19) + 'Z', answer_text: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), status: faker.helpers.arrayElement(['pending','scored'] as const), llm_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), final_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), fresh_signal: faker.datatype.boolean(), feedback: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}, ...overrideResponse});

export const getGetMyTaskResponseMock = (overrideResponse: Partial<Extract<TaskAssignment, object>> = {}): TaskAssignment => ({task: {id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Идемпотентный обработчик платежа", description: faker.string.alpha({length: {min: 10, max: 20}}), kind: faker.helpers.arrayElement(Object.values(TaskKind)), specializations: faker.helpers.arrayElements(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), time_limit_min: faker.number.int({min: 5, max: 30}), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), starter_code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), rubric: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({criterion: "Корректность на граничных случаях", weight: faker.number.float({min: 0, max: 1, fractionDigits: 2})})), status: faker.helpers.arrayElement(['active','closed'] as const), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', assigned_count: faker.helpers.arrayElement([faker.number.int(), null]), submissions_count: faker.helpers.arrayElement([faker.number.int(), null])}, status: faker.helpers.arrayElement(Object.values(TaskAssignmentStatus)), assigned_at: faker.date.past().toISOString().slice(0, 19) + 'Z', due_at: faker.date.past().toISOString().slice(0, 19) + 'Z', submission: faker.helpers.arrayElement([{...getGetMyTaskResponseTaskSubmissionMock()},null,]), ...overrideResponse})

export const getSubmitTaskResponseMock = (overrideResponse: Partial<Extract<TaskSubmission, object>> = {}): TaskSubmission => ({id: faker.string.uuid(), task_id: faker.string.uuid(), submitted_at: faker.date.past().toISOString().slice(0, 19) + 'Z', answer_text: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), status: faker.helpers.arrayElement(['pending','scored'] as const), llm_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), final_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), fresh_signal: faker.datatype.boolean(), feedback: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), ...overrideResponse})

export const getListCompanyTasksResponseMock = (): RegularTask[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Идемпотентный обработчик платежа", description: faker.string.alpha({length: {min: 10, max: 20}}), kind: faker.helpers.arrayElement(Object.values(TaskKind)), specializations: faker.helpers.arrayElements(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), time_limit_min: faker.number.int({min: 5, max: 30}), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), starter_code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), rubric: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({criterion: "Корректность на граничных случаях", weight: faker.number.float({min: 0, max: 1, fractionDigits: 2})})), status: faker.helpers.arrayElement(['active','closed'] as const), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', assigned_count: faker.helpers.arrayElement([faker.number.int(), null]), submissions_count: faker.helpers.arrayElement([faker.number.int(), null])})))

export const getCreateCompanyTaskResponseMock = (overrideResponse: Partial<Extract<RegularTask, object>> = {}): RegularTask => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Идемпотентный обработчик платежа", description: faker.string.alpha({length: {min: 10, max: 20}}), kind: faker.helpers.arrayElement(Object.values(TaskKind)), specializations: faker.helpers.arrayElements(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), time_limit_min: faker.number.int({min: 5, max: 30}), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), starter_code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), rubric: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({criterion: "Корректность на граничных случаях", weight: faker.number.float({min: 0, max: 1, fractionDigits: 2})})), status: faker.helpers.arrayElement(['active','closed'] as const), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', assigned_count: faker.helpers.arrayElement([faker.number.int(), null]), submissions_count: faker.helpers.arrayElement([faker.number.int(), null]), ...overrideResponse})

export const getGetCompanyTaskResponseMock = (overrideResponse: Partial<Extract<RegularTask, object>> = {}): RegularTask => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Идемпотентный обработчик платежа", description: faker.string.alpha({length: {min: 10, max: 20}}), kind: faker.helpers.arrayElement(Object.values(TaskKind)), specializations: faker.helpers.arrayElements(Object.values(Specialization)), grades: faker.helpers.arrayElements(Object.values(Grade)), time_limit_min: faker.number.int({min: 5, max: 30}), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), starter_code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), rubric: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({criterion: "Корректность на граничных случаях", weight: faker.number.float({min: 0, max: 1, fractionDigits: 2})})), status: faker.helpers.arrayElement(['active','closed'] as const), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', assigned_count: faker.helpers.arrayElement([faker.number.int(), null]), submissions_count: faker.helpers.arrayElement([faker.number.int(), null]), ...overrideResponse})

export const getListTaskSubmissionsResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getListTaskSubmissionsResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getListTaskSubmissionsResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getListTaskSubmissionsResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getListTaskSubmissionsResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getListTaskSubmissionsResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getListTaskSubmissionsResponseMock = (): EmployerTaskSubmission[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({...{id: faker.string.uuid(), task_id: faker.string.uuid(), submitted_at: faker.date.past().toISOString().slice(0, 19) + 'Z', answer_text: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), status: faker.helpers.arrayElement(['pending','scored'] as const), llm_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), final_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), fresh_signal: faker.datatype.boolean(), feedback: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])},...{candidate: {id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getListTaskSubmissionsResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss','leak_suspected'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getListTaskSubmissionsResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getListTaskSubmissionsResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getListTaskSubmissionsResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}}},})))

export const getScoreTaskSubmissionResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getScoreTaskSubmissionResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getScoreTaskSubmissionResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getScoreTaskSubmissionResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getScoreTaskSubmissionResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getScoreTaskSubmissionResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getScoreTaskSubmissionResponseMock = (): EmployerTaskSubmission => ({...{id: faker.string.uuid(), task_id: faker.string.uuid(), submitted_at: faker.date.past().toISOString().slice(0, 19) + 'Z', answer_text: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), status: faker.helpers.arrayElement(['pending','scored'] as const), llm_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), final_score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null]), fresh_signal: faker.datatype.boolean(), feedback: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])},...{candidate: {id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getScoreTaskSubmissionResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss','leak_suspected'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 130, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getScoreTaskSubmissionResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getScoreTaskSubmissionResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getScoreTaskSubmissionResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}}},})


export const getListMyTasksMockHandler = (overrideResponse?: TaskAssignment[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TaskAssignment[]> | TaskAssignment[]), options?: RequestHandlerOptions) => {
  return http.get('*/me/tasks', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListMyTasksResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetMyTaskMockHandler = (overrideResponse?: TaskAssignment | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TaskAssignment> | TaskAssignment), options?: RequestHandlerOptions) => {
  return http.get('*/me/tasks/:taskId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyTaskResponseMock(),
      { status: 200
      })
  }, options)
}

export const getSubmitTaskMockHandler = (overrideResponse?: TaskSubmission | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<TaskSubmission> | TaskSubmission), options?: RequestHandlerOptions) => {
  return http.post('*/tasks/:taskId/submissions', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getSubmitTaskResponseMock(),
      { status: 201
      })
  }, options)
}

export const getListCompanyTasksMockHandler = (overrideResponse?: RegularTask[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<RegularTask[]> | RegularTask[]), options?: RequestHandlerOptions) => {
  return http.get('*/regular-tasks', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListCompanyTasksResponseMock(),
      { status: 200
      })
  }, options)
}

export const getCreateCompanyTaskMockHandler = (overrideResponse?: RegularTask | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<RegularTask> | RegularTask), options?: RequestHandlerOptions) => {
  return http.post('*/regular-tasks', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getCreateCompanyTaskResponseMock(),
      { status: 201
      })
  }, options)
}

export const getGetCompanyTaskMockHandler = (overrideResponse?: RegularTask | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<RegularTask> | RegularTask), options?: RequestHandlerOptions) => {
  return http.get('*/regular-tasks/:taskId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetCompanyTaskResponseMock(),
      { status: 200
      })
  }, options)
}

export const getListTaskSubmissionsMockHandler = (overrideResponse?: EmployerTaskSubmission[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<EmployerTaskSubmission[]> | EmployerTaskSubmission[]), options?: RequestHandlerOptions) => {
  return http.get('*/regular-tasks/:taskId/submissions', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListTaskSubmissionsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getScoreTaskSubmissionMockHandler = (overrideResponse?: EmployerTaskSubmission | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<EmployerTaskSubmission> | EmployerTaskSubmission), options?: RequestHandlerOptions) => {
  return http.post('*/regular-tasks/:taskId/submissions/:submissionId/score', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getScoreTaskSubmissionResponseMock(),
      { status: 200
      })
  }, options)
}
export const getTasksMock = () => [
  getListMyTasksMockHandler(),
  getGetMyTaskMockHandler(),
  getSubmitTaskMockHandler(),
  getListCompanyTasksMockHandler(),
  getCreateCompanyTaskMockHandler(),
  getGetCompanyTaskMockHandler(),
  getListTaskSubmissionsMockHandler(),
  getScoreTaskSubmissionMockHandler()
]
