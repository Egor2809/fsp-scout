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
  Grade,
  Industry,
  Specialization,
  WorkFormat
} from '../../model';
import type {
  ConfirmedNeed,
  Need,
  NeedCategories,
  SalaryRadar,
  SalaryRange
} from '../../model';


export const getCreateNeedResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getCreateNeedResponseConfirmedNeedMock = (overrideResponse: Partial<ConfirmedNeed> = {}): ConfirmedNeed => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), salary: {"from":250000,"to":320000}}, ...overrideResponse});

export const getCreateNeedResponseMock = (overrideResponse: Partial<Extract<Need, object>> = {}): Need => ({id: faker.string.uuid(), raw_text: faker.string.alpha({length: {min: 10, max: 20}}), parsed: {specialization: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Specialization)),null,]), grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), salary: faker.helpers.arrayElement([{...getCreateNeedResponseSalaryRangeMock()},null,]), unrecognized: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}})))}, confirmed: faker.helpers.arrayElement([{...getCreateNeedResponseConfirmedNeedMock()},null,]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getGetNeedResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getGetNeedResponseConfirmedNeedMock = (overrideResponse: Partial<ConfirmedNeed> = {}): ConfirmedNeed => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), salary: {"from":250000,"to":320000}}, ...overrideResponse});

export const getGetNeedResponseMock = (overrideResponse: Partial<Extract<Need, object>> = {}): Need => ({id: faker.string.uuid(), raw_text: faker.string.alpha({length: {min: 10, max: 20}}), parsed: {specialization: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Specialization)),null,]), grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), salary: faker.helpers.arrayElement([{...getGetNeedResponseSalaryRangeMock()},null,]), unrecognized: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}})))}, confirmed: faker.helpers.arrayElement([{...getGetNeedResponseConfirmedNeedMock()},null,]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getConfirmNeedResponseSalaryRangeMock = (overrideResponse: Partial<SalaryRange> = {}): SalaryRange => ({...{"from":250000,"to":320000}, ...overrideResponse});

export const getConfirmNeedResponseConfirmedNeedMock = (overrideResponse: Partial<ConfirmedNeed> = {}): ConfirmedNeed => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), salary: {"from":250000,"to":320000}}, ...overrideResponse});

export const getConfirmNeedResponseMock = (overrideResponse: Partial<Extract<Need, object>> = {}): Need => ({id: faker.string.uuid(), raw_text: faker.string.alpha({length: {min: 10, max: 20}}), parsed: {specialization: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Specialization)),null,]), grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), must_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), nice_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "go", name: "Go"})), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), industry: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Industry)),null,]), salary: faker.helpers.arrayElement([{...getConfirmNeedResponseSalaryRangeMock()},null,]), unrecognized: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}})))}, confirmed: faker.helpers.arrayElement([{...getConfirmNeedResponseConfirmedNeedMock()},null,]), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getGetNeedCategoriesResponseMock = (overrideResponse: Partial<Extract<NeedCategories, object>> = {}): NeedCategories => ({need_id: faker.string.uuid(), salary: {"from":250000,"to":320000}, items: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({category: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, kind: faker.helpers.arrayElement(['primary','adjacent'] as const), candidate_count: faker.number.int({min: 0}), median_expectation: faker.helpers.arrayElement([faker.number.int(), null]), reason: "Middle Python с подтверждённым Go", radar: {category: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, salary: {"from":250000,"to":320000}, candidates_total: faker.number.int({min: 0}), share_above: 0.6, share_within: faker.number.float({min: 0, max: 1, fractionDigits: 2}), share_below: faker.number.float({min: 0, max: 1, fractionDigits: 2}), median: faker.helpers.arrayElement([faker.number.int(), null]), p25: faker.helpers.arrayElement([faker.number.int(), null]), p75: faker.helpers.arrayElement([faker.number.int(), null]), histogram: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({from: faker.number.int(), to: faker.number.int(), count: faker.number.int({min: 0})})), verdict: faker.helpers.arrayElement(['below_market','in_market','above_market'] as const), message: "Ваша вилка ниже ожиданий 60% кандидатов Backend · Middle"}})), ...overrideResponse})

export const getGetSalaryRadarResponseMock = (overrideResponse: Partial<Extract<SalaryRadar, object>> = {}): SalaryRadar => ({category: {specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, salary: {"from":250000,"to":320000}, candidates_total: faker.number.int({min: 0}), share_above: 0.6, share_within: faker.number.float({min: 0, max: 1, fractionDigits: 2}), share_below: faker.number.float({min: 0, max: 1, fractionDigits: 2}), median: faker.helpers.arrayElement([faker.number.int(), null]), p25: faker.helpers.arrayElement([faker.number.int(), null]), p75: faker.helpers.arrayElement([faker.number.int(), null]), histogram: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({from: faker.number.int(), to: faker.number.int(), count: faker.number.int({min: 0})})), verdict: faker.helpers.arrayElement(['below_market','in_market','above_market'] as const), message: "Ваша вилка ниже ожиданий 60% кандидатов Backend · Middle", ...overrideResponse})


export const getCreateNeedMockHandler = (overrideResponse?: Need | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Need> | Need), options?: RequestHandlerOptions) => {
  return http.post('*/needs', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getCreateNeedResponseMock(),
      { status: 201
      })
  }, options)
}

export const getGetNeedMockHandler = (overrideResponse?: Need | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Need> | Need), options?: RequestHandlerOptions) => {
  return http.get('*/needs/:needId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetNeedResponseMock(),
      { status: 200
      })
  }, options)
}

export const getConfirmNeedMockHandler = (overrideResponse?: Need | ((info: Parameters<Parameters<typeof http.put>[1]>[0]) => Promise<Need> | Need), options?: RequestHandlerOptions) => {
  return http.put('*/needs/:needId', async (info: Parameters<Parameters<typeof http.put>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getConfirmNeedResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetNeedCategoriesMockHandler = (overrideResponse?: NeedCategories | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<NeedCategories> | NeedCategories), options?: RequestHandlerOptions) => {
  return http.get('*/needs/:needId/categories', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetNeedCategoriesResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetSalaryRadarMockHandler = (overrideResponse?: SalaryRadar | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<SalaryRadar> | SalaryRadar), options?: RequestHandlerOptions) => {
  return http.get('*/salary-radar', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetSalaryRadarResponseMock(),
      { status: 200
      })
  }, options)
}
export const getNeedsMock = () => [
  getCreateNeedMockHandler(),
  getGetNeedMockHandler(),
  getConfirmNeedMockHandler(),
  getGetNeedCategoriesMockHandler(),
  getGetSalaryRadarMockHandler()
]
