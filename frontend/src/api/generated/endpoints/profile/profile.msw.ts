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
  FspDiscipline,
  FspFormat,
  FspLevel,
  FspResult,
  Grade,
  Industry,
  InvitationStatus,
  ProfileVisibility,
  SkillLevel,
  SkillSource,
  Specialization,
  WorkFormat
} from '../../model';
import type {
  CandidateCard,
  CandidateContacts,
  CandidateProfile,
  Category,
  CategoryStanding,
  FspAchievement,
  FspSummary,
  PrivacySettings,
  ResumeParseResult,
  SalaryRange
} from '../../model';


export const getGetMyProfileResponseCategoryStandingMock = (overrideResponse: Partial<CategoryStanding> = {}): CategoryStanding => ({...{category: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, percentile: 82, confirmed_at: faker.date.past().toISOString().slice(0, 19) + 'Z', test_id: faker.string.uuid(), flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined])}, ...overrideResponse});

export const getGetMyProfileResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getGetMyProfileResponseMock = (overrideResponse: Partial<Extract<CandidateProfile, object>> = {}): CandidateProfile => ({id: faker.string.uuid(), full_name: "Алексей Смирнов", email: faker.internet.email(), phone: "+7 915 123-45-67", telegram: "@a_smirnov", city: "Казань", relocation: faker.datatype.boolean(), about: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 2000}}), null]), specialization: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Specialization)),null,]), standing: faker.helpers.arrayElement([{...getGetMyProfileResponseCategoryStandingMock()},null,]), experience_years: 3.5, experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), salary_expectation: faker.helpers.arrayElement([{...getGetMyProfileResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), completeness: faker.number.int({min: 0, max: 100}), visibility: faker.helpers.arrayElement(Object.values(ProfileVisibility)), updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getUpdateMyProfileResponseCategoryStandingMock = (overrideResponse: Partial<CategoryStanding> = {}): CategoryStanding => ({...{category: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, percentile: 82, confirmed_at: faker.date.past().toISOString().slice(0, 19) + 'Z', test_id: faker.string.uuid(), flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined])}, ...overrideResponse});

export const getUpdateMyProfileResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getUpdateMyProfileResponseMock = (overrideResponse: Partial<Extract<CandidateProfile, object>> = {}): CandidateProfile => ({id: faker.string.uuid(), full_name: "Алексей Смирнов", email: faker.internet.email(), phone: "+7 915 123-45-67", telegram: "@a_smirnov", city: "Казань", relocation: faker.datatype.boolean(), about: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 2000}}), null]), specialization: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Specialization)),null,]), standing: faker.helpers.arrayElement([{...getUpdateMyProfileResponseCategoryStandingMock()},null,]), experience_years: 3.5, experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), salary_expectation: faker.helpers.arrayElement([{...getUpdateMyProfileResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), completeness: faker.number.int({min: 0, max: 100}), visibility: faker.helpers.arrayElement(Object.values(ProfileVisibility)), updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getUploadMyResumeResponseMock = (overrideResponse: Partial<Extract<ResumeParseResult, object>> = {}): ResumeParseResult => ({resume_id: faker.string.uuid(), file_name: "Смирнов_CV.pdf", uploaded_at: faker.date.past().toISOString().slice(0, 19) + 'Z', fields: {full_name: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), email: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), experience_years: faker.helpers.arrayElement([faker.number.float({fractionDigits: 2}), null]), roles: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({raw: "постгрес", skill_id: "postgresql", name: "PostgreSQL"})), soft_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), about: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}, confidence: {"full_name":0.98,"email":0.99,"skills":0.81,"experience_years":0.64}, warnings: ["Стаж посчитан по датам, проверьте"], ...overrideResponse})

export const getDownloadMyProfilePdfResponseMock = (): Blob => (new Blob([new Uint8Array(faker.number.int({ min: 1, max: 64 }))]))

export const getGetMyCardPreviewResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getGetMyCardPreviewResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getGetMyCardPreviewResponseFspAchievementMock = (overrideResponse: Partial<FspAchievement> = {}): FspAchievement => ({...{id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()}, ...overrideResponse});

export const getGetMyCardPreviewResponseFspSummaryMock = (overrideResponse: Partial<FspSummary> = {}): FspSummary => ({...{has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 15, fractionDigits: 2}), achievements_count: faker.number.int({min: 0}), top_achievement: faker.helpers.arrayElement([{...getGetMyCardPreviewResponseFspAchievementMock()},null,]), max_level: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(FspLevel)),null,])}, ...overrideResponse});

export const getGetMyCardPreviewResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getGetMyCardPreviewResponseMock = (overrideResponse: Partial<Extract<CandidateCard, object>> = {}): CandidateCard => ({id: faker.string.uuid(), alias: "Кандидат #7F3A", category: faker.helpers.arrayElement([{...getGetMyCardPreviewResponseCategoryMock()},null,]), grade_confirmed: faker.datatype.boolean(), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), test_flags: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const)})), undefined]), strength: faker.number.float({min: 0, max: 115, fractionDigits: 2}), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), experience_years: faker.number.float({fractionDigits: 2}), experience: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({role: "Backend-разработчик", company_name: "ООО «Платёжные решения»", company_hidden: faker.datatype.boolean(), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), start: "2023-02", end: faker.helpers.arrayElement([faker.helpers.fromRegExp("^\\d{4}-(0[1-9]|1[0-2])$"), null]), description: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 1000}}), null])})), industries: faker.helpers.arrayElements(Object.values(Industry)), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), relocation: faker.datatype.boolean(), salary_expectation: faker.helpers.arrayElement([{...getGetMyCardPreviewResponseSalaryRangeMock()},null,]), availability: faker.helpers.arrayElement(Object.values(Availability)), last_active_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp: faker.helpers.arrayElement([{...getGetMyCardPreviewResponseFspSummaryMock()},null,]), task_signal: {fresh: faker.datatype.boolean(), solved_count: faker.number.int({min: 0}), last_solved_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])}, disclosure: {revealed: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DisclosureReason)),null,]), revealed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), source_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, contacts: faker.helpers.arrayElement([{...getGetMyCardPreviewResponseCandidateContactsMock()},null,]), relation: {invitation: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus))},null,]), application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus)), vacancy_id: faker.string.uuid()},null,])}, ...overrideResponse})

export const getGetMyPrivacyResponseMock = (overrideResponse: Partial<Extract<PrivacySettings, object>> = {}): PrivacySettings => ({availability: faker.helpers.arrayElement(Object.values(Availability)), salary_floor: 240000, hidden_companies: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()})), show_fsp: faker.datatype.boolean(), show_company_names: faker.datatype.boolean(), show_city: faker.datatype.boolean(), profile_published: faker.datatype.boolean(), ...overrideResponse})

export const getUpdateMyPrivacyResponseMock = (overrideResponse: Partial<Extract<PrivacySettings, object>> = {}): PrivacySettings => ({availability: faker.helpers.arrayElement(Object.values(Availability)), salary_floor: 240000, hidden_companies: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()})), show_fsp: faker.datatype.boolean(), show_company_names: faker.datatype.boolean(), show_city: faker.datatype.boolean(), profile_published: faker.datatype.boolean(), ...overrideResponse})


export const getGetMyProfileMockHandler = (overrideResponse?: CandidateProfile | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<CandidateProfile> | CandidateProfile), options?: RequestHandlerOptions) => {
  return http.get('*/me/profile', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyProfileResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateMyProfileMockHandler = (overrideResponse?: CandidateProfile | ((info: Parameters<Parameters<typeof http.put>[1]>[0]) => Promise<CandidateProfile> | CandidateProfile), options?: RequestHandlerOptions) => {
  return http.put('*/me/profile', async (info: Parameters<Parameters<typeof http.put>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateMyProfileResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUploadMyResumeMockHandler = (overrideResponse?: ResumeParseResult | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<ResumeParseResult> | ResumeParseResult), options?: RequestHandlerOptions) => {
  return http.post('*/me/resume', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUploadMyResumeResponseMock(),
      { status: 200
      })
  }, options)
}

export const getDownloadMyProfilePdfMockHandler = (overrideResponse?: Blob | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Blob> | Blob), options?: RequestHandlerOptions) => {
  return http.get('*/me/profile.pdf', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {

  const binaryBody = overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getDownloadMyProfilePdfResponseMock();
    return new HttpResponse(binaryBody,
      { status: 200,
        headers: { 'Content-Type': 'application/pdf' }
      })
  }, options)
}

export const getGetMyCardPreviewMockHandler = (overrideResponse?: CandidateCard | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<CandidateCard> | CandidateCard), options?: RequestHandlerOptions) => {
  return http.get('*/me/card-preview', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyCardPreviewResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetMyPrivacyMockHandler = (overrideResponse?: PrivacySettings | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<PrivacySettings> | PrivacySettings), options?: RequestHandlerOptions) => {
  return http.get('*/me/privacy', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyPrivacyResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateMyPrivacyMockHandler = (overrideResponse?: PrivacySettings | ((info: Parameters<Parameters<typeof http.put>[1]>[0]) => Promise<PrivacySettings> | PrivacySettings), options?: RequestHandlerOptions) => {
  return http.put('*/me/privacy', async (info: Parameters<Parameters<typeof http.put>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateMyPrivacyResponseMock(),
      { status: 200
      })
  }, options)
}
export const getProfileMock = () => [
  getGetMyProfileMockHandler(),
  getUpdateMyProfileMockHandler(),
  getUploadMyResumeMockHandler(),
  getDownloadMyProfilePdfMockHandler(),
  getGetMyCardPreviewMockHandler(),
  getGetMyPrivacyMockHandler(),
  getUpdateMyPrivacyMockHandler()
]
