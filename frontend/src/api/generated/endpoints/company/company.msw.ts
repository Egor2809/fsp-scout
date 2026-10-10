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
  FactorKind,
  Grade,
  Industry,
  Polarity,
  Specialization,
  VacancyStatus,
  WorkFormat
} from '../../model';
import type {
  Company,
  InvitationQuota,
  Vacancy
} from '../../model';


export const getGetMyCompanyResponseMock = (overrideResponse: Partial<Extract<Company, object>> = {}): Company => ({id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), description: faker.string.alpha({length: {min: 10, max: 3000}}), website: faker.helpers.arrayElement([faker.internet.url(), null]), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), size: faker.helpers.arrayElement(['1-50','51-200','201-1000','1000+'] as const), inn: faker.helpers.arrayElement([faker.helpers.fromRegExp("^(\\d{10}|\\d{12})$"), null]), contact_email: faker.internet.email(), contact_phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), verified: faker.datatype.boolean(), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getUpdateMyCompanyResponseMock = (overrideResponse: Partial<Extract<Company, object>> = {}): Company => ({id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), description: faker.string.alpha({length: {min: 10, max: 3000}}), website: faker.helpers.arrayElement([faker.internet.url(), null]), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), size: faker.helpers.arrayElement(['1-50','51-200','201-1000','1000+'] as const), inn: faker.helpers.arrayElement([faker.helpers.fromRegExp("^(\\d{10}|\\d{12})$"), null]), contact_email: faker.internet.email(), contact_phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), verified: faker.datatype.boolean(), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getGetInvitationQuotaResponseMock = (overrideResponse: Partial<Extract<InvitationQuota, object>> = {}): InvitationQuota => ({limit: 22, used: 7, remaining: 15, period_start: faker.date.past().toISOString().slice(0, 19) + 'Z', period_end: faker.date.past().toISOString().slice(0, 19) + 'Z', penalty: faker.helpers.arrayElement([faker.number.int({min: 0}), undefined]), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), bonus: faker.number.int({min: 0}), ...overrideResponse})

export const getListMyCompanyVacanciesResponseMock = (): Vacancy[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, title: "Middle Go-разработчик (платежи)", description: faker.string.alpha({length: {min: 10, max: 20}}), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), salary: {"from":250000,"to":320000}, status: faker.helpers.arrayElement(Object.values(VacancyStatus)), published_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', applications_count: faker.helpers.arrayElement([faker.number.int(), null]), my_application: faker.helpers.arrayElement([{id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(ApplicationStatus))},null,]), match: faker.helpers.arrayElement([{score: faker.number.float({min: 0, max: 100, fractionDigits: 2}), chips: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))},null,])})))


export const getGetMyCompanyMockHandler = (overrideResponse?: Company | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Company> | Company), options?: RequestHandlerOptions) => {
  return http.get('*/company', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyCompanyResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateMyCompanyMockHandler = (overrideResponse?: Company | ((info: Parameters<Parameters<typeof http.put>[1]>[0]) => Promise<Company> | Company), options?: RequestHandlerOptions) => {
  return http.put('*/company', async (info: Parameters<Parameters<typeof http.put>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateMyCompanyResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetInvitationQuotaMockHandler = (overrideResponse?: InvitationQuota | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<InvitationQuota> | InvitationQuota), options?: RequestHandlerOptions) => {
  return http.get('*/company/invitation-quota', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetInvitationQuotaResponseMock(),
      { status: 200
      })
  }, options)
}

export const getListMyCompanyVacanciesMockHandler = (overrideResponse?: Vacancy[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Vacancy[]> | Vacancy[]), options?: RequestHandlerOptions) => {
  return http.get('*/company/vacancies', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListMyCompanyVacanciesResponseMock(),
      { status: 200
      })
  }, options)
}
export const getCompanyMock = () => [
  getGetMyCompanyMockHandler(),
  getUpdateMyCompanyMockHandler(),
  getGetInvitationQuotaMockHandler(),
  getListMyCompanyVacanciesMockHandler()
]
