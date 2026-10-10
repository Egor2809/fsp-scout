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
  FactorKind,
  Grade,
  Polarity,
  Specialization
} from '../../model';
import type {
  Category,
  EvalRankResponse,
  ProfileVerification
} from '../../model';


export const getVerifyProfileResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getVerifyProfileResponseMock = (overrideResponse: Partial<Extract<ProfileVerification, object>> = {}): ProfileVerification => ({valid: faker.datatype.boolean(), full_name: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getVerifyProfileResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null]), confirmed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), fsp_achievements_count: faker.number.int(), issued_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getEvalRankResponseMock = (overrideResponse: Partial<Extract<EvalRankResponse | string, object>> = {}): EvalRankResponse | string => (faker.helpers.arrayElement([{results: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({vacancy_id: faker.string.alpha({length: {min: 10, max: 20}}), ranking: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({candidate_id: faker.string.alpha({length: {min: 10, max: 20}}), score: faker.number.float({fractionDigits: 2}), factors: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({kind: faker.helpers.arrayElement(Object.values(FactorKind)), label: "Go, PostgreSQL подтверждены тестом", contribution: 18.4, polarity: faker.helpers.arrayElement(Object.values(Polarity)), evidence: "88-й перцентиль в Backend · Middle"}))}))})), ...overrideResponse}, faker.word.sample()]))


export const getVerifyProfileMockHandler = (overrideResponse?: ProfileVerification | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<ProfileVerification> | ProfileVerification), options?: RequestHandlerOptions) => {
  return http.get('*/verify/:profileToken', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getVerifyProfileResponseMock(),
      { status: 200
      })
  }, options)
}

export const getEvalRankMockHandler = (overrideResponse?: EvalRankResponse | string | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<EvalRankResponse | string> | EvalRankResponse | string), options?: RequestHandlerOptions) => {
  return http.post('*/eval/rank', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {

  const resolvedBody = overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getEvalRankResponseMock();
    return typeof resolvedBody === 'string'
      ? HttpResponse.text(resolvedBody, { status: 200, headers: { 'Content-Type': 'text/csv' } })
      : HttpResponse.json(resolvedBody, { status: 200 })
  }, options)
}

export const getFspWebhookMockHandler = (overrideResponse?: void | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<void> | void), options?: RequestHandlerOptions) => {
  return http.post('*/webhooks/fsp', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }

    return new HttpResponse(null,
      { status: 202
      })
  }, options)
}
export const getServiceMock = () => [
  getVerifyProfileMockHandler(),
  getEvalRankMockHandler(),
  getFspWebhookMockHandler()
]
