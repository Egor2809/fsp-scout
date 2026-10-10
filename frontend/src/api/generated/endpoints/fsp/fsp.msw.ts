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
  FspDiscipline,
  FspFormat,
  FspLevel,
  FspResult
} from '../../model';
import type {
  FspProfile
} from '../../model';


export const getGetMyFspResponseMock = (overrideResponse: Partial<Extract<FspProfile, object>> = {}): FspProfile => ({linked: faker.datatype.boolean(), fsp_id: "FSP-77-004215", verified_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), components: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({achievement_id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), level_weight: faker.number.float({fractionDigits: 2}), result_weight: faker.number.float({fractionDigits: 2}), relevance: faker.number.float({min: 0, max: 1, fractionDigits: 2}), decay: faker.number.float({min: 0, max: 1, fractionDigits: 2}), contribution: faker.number.float({fractionDigits: 2})})), achievements: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()})), ...overrideResponse})

export const getLinkMyFspResponseMock = (overrideResponse: Partial<Extract<FspProfile, object>> = {}): FspProfile => ({linked: faker.datatype.boolean(), fsp_id: "FSP-77-004215", verified_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), components: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({achievement_id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), level_weight: faker.number.float({fractionDigits: 2}), result_weight: faker.number.float({fractionDigits: 2}), relevance: faker.number.float({min: 0, max: 1, fractionDigits: 2}), decay: faker.number.float({min: 0, max: 1, fractionDigits: 2}), contribution: faker.number.float({fractionDigits: 2})})), achievements: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()})), ...overrideResponse})

export const getUnlinkMyFspResponseMock = (overrideResponse: Partial<Extract<FspProfile, object>> = {}): FspProfile => ({linked: faker.datatype.boolean(), fsp_id: "FSP-77-004215", verified_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), has_history: faker.datatype.boolean(), index: faker.number.int({min: 0, max: 100}), bonus: faker.number.float({min: 0, max: 30, fractionDigits: 2}), components: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({achievement_id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), level_weight: faker.number.float({fractionDigits: 2}), result_weight: faker.number.float({fractionDigits: 2}), relevance: faker.number.float({min: 0, max: 1, fractionDigits: 2}), decay: faker.number.float({min: 0, max: 1, fractionDigits: 2}), contribution: faker.number.float({fractionDigits: 2})})), achievements: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), event_id: "fsp-2025-prod-final", title: "Чемпионат России по продуктовому программированию 2025", date: faker.date.past().toISOString().slice(0, 10), level: faker.helpers.arrayElement(Object.values(FspLevel)), discipline: faker.helpers.arrayElement(Object.values(FspDiscipline)), format: faker.helpers.arrayElement(Object.values(FspFormat)), team: "404 Not Found", role: "Backend", place: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), participants_total: faker.helpers.arrayElement([faker.number.int({min: 1}), null]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), result: faker.helpers.arrayElement(Object.values(FspResult)), sport_rank: "КМС", certificate_url: faker.helpers.arrayElement([faker.internet.url(), null]), verified: faker.datatype.boolean()})), ...overrideResponse})


export const getGetMyFspMockHandler = (overrideResponse?: FspProfile | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<FspProfile> | FspProfile), options?: RequestHandlerOptions) => {
  return http.get('*/me/fsp', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyFspResponseMock(),
      { status: 200
      })
  }, options)
}

export const getLinkMyFspMockHandler = (overrideResponse?: FspProfile | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<FspProfile> | FspProfile), options?: RequestHandlerOptions) => {
  return http.post('*/me/fsp/link', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getLinkMyFspResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUnlinkMyFspMockHandler = (overrideResponse?: FspProfile | ((info: Parameters<Parameters<typeof http.delete>[1]>[0]) => Promise<FspProfile> | FspProfile), options?: RequestHandlerOptions) => {
  return http.delete('*/me/fsp/link', async (info: Parameters<Parameters<typeof http.delete>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUnlinkMyFspResponseMock(),
      { status: 200
      })
  }, options)
}
export const getFspMock = () => [
  getGetMyFspMockHandler(),
  getLinkMyFspMockHandler(),
  getUnlinkMyFspMockHandler()
]
