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
  ConsentType,
  Industry,
  OnboardingStep,
  Role
} from '../../model';
import type {
  AccountDeletion,
  CompanyBrief,
  ConsentState,
  CurrentUser,
  ExportMyData200,
  OnboardingState
} from '../../model';


export const getGetMeResponseOnboardingStateMock = (overrideResponse: Partial<OnboardingState> = {}): OnboardingState => ({...{consents_given: faker.datatype.boolean(), survey_completed: faker.datatype.boolean(), grade_confirmed: faker.datatype.boolean(), next_step: faker.helpers.arrayElement(Object.values(OnboardingStep)), active_test_id: faker.helpers.arrayElement([faker.string.uuid(), null])}, ...overrideResponse});

export const getGetMeResponseCompanyBriefMock = (overrideResponse: Partial<CompanyBrief> = {}): CompanyBrief => ({...{id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, ...overrideResponse});

export const getGetMeResponseMock = (overrideResponse: Partial<Extract<CurrentUser, object>> = {}): CurrentUser => ({id: faker.string.uuid(), role: faker.helpers.arrayElement(Object.values(Role)), email: "candidate@demo.scout", display_name: "Алексей Смирнов", onboarding: faker.helpers.arrayElement([{...getGetMeResponseOnboardingStateMock()},null,]), company: faker.helpers.arrayElement([{...getGetMeResponseCompanyBriefMock()},null,]), ...overrideResponse})

export const getDeleteMeResponseMock = (overrideResponse: Partial<Extract<AccountDeletion, object>> = {}): AccountDeletion => ({scheduled_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getExportMyDataResponseMock = (): ExportMyData200 => ({})

export const getGetMyConsentsResponseMock = (overrideResponse: Partial<Extract<ConsentState, object>> = {}): ConsentState => ({documents: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({type: faker.helpers.arrayElement(Object.values(ConsentType)), version: "2026-09", title: "Согласие на обработку персональных данных", summary: faker.string.alpha({length: {min: 10, max: 20}}), required: faker.datatype.boolean(), document_url: faker.string.alpha({length: {min: 10, max: 20}})})), consents: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({type: faker.helpers.arrayElement(Object.values(ConsentType)), version: faker.string.alpha({length: {min: 10, max: 20}}), given_at: faker.date.past().toISOString().slice(0, 19) + 'Z', revoked_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])})), ...overrideResponse})

export const getUpdateMyConsentsResponseMock = (overrideResponse: Partial<Extract<ConsentState, object>> = {}): ConsentState => ({documents: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({type: faker.helpers.arrayElement(Object.values(ConsentType)), version: "2026-09", title: "Согласие на обработку персональных данных", summary: faker.string.alpha({length: {min: 10, max: 20}}), required: faker.datatype.boolean(), document_url: faker.string.alpha({length: {min: 10, max: 20}})})), consents: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({type: faker.helpers.arrayElement(Object.values(ConsentType)), version: faker.string.alpha({length: {min: 10, max: 20}}), given_at: faker.date.past().toISOString().slice(0, 19) + 'Z', revoked_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])})), ...overrideResponse})


export const getGetMeMockHandler = (overrideResponse?: CurrentUser | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<CurrentUser> | CurrentUser), options?: RequestHandlerOptions) => {
  return http.get('*/me', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMeResponseMock(),
      { status: 200
      })
  }, options)
}

export const getDeleteMeMockHandler = (overrideResponse?: AccountDeletion | ((info: Parameters<Parameters<typeof http.delete>[1]>[0]) => Promise<AccountDeletion> | AccountDeletion), options?: RequestHandlerOptions) => {
  return http.delete('*/me', async (info: Parameters<Parameters<typeof http.delete>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getDeleteMeResponseMock(),
      { status: 202
      })
  }, options)
}

export const getExportMyDataMockHandler = (overrideResponse?: ExportMyData200 | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<ExportMyData200> | ExportMyData200), options?: RequestHandlerOptions) => {
  return http.get('*/me/export', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getExportMyDataResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetMyConsentsMockHandler = (overrideResponse?: ConsentState | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<ConsentState> | ConsentState), options?: RequestHandlerOptions) => {
  return http.get('*/me/consents', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyConsentsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateMyConsentsMockHandler = (overrideResponse?: ConsentState | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<ConsentState> | ConsentState), options?: RequestHandlerOptions) => {
  return http.post('*/me/consents', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateMyConsentsResponseMock(),
      { status: 200
      })
  }, options)
}
export const getMeMock = () => [
  getGetMeMockHandler(),
  getDeleteMeMockHandler(),
  getExportMyDataMockHandler(),
  getGetMyConsentsMockHandler(),
  getUpdateMyConsentsMockHandler()
]
