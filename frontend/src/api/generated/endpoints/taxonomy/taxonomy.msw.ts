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
  Specialization
} from '../../model';
import type {
  CompanyBrief,
  Taxonomy
} from '../../model';


export const getGetTaxonomyResponseMock = (overrideResponse: Partial<Extract<Taxonomy, object>> = {}): Taxonomy => ({specializations: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.helpers.arrayElement(Object.values(Specialization)), name: "Backend", competencies: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "backend.databases", name: "Базы данных"}))})), grades: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.helpers.arrayElement(Object.values(Grade)), name: "Middle", experience: "1–3 года"})), industries: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.helpers.arrayElement(Object.values(Industry)), name: "Финтех"})), skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "kubernetes", name: "Kubernetes", specializations: faker.helpers.arrayElements(Object.values(Specialization)), competency_id: "devops.orchestration", aliases: ["k8s","кубер","кубернетес"]})), cities: ["Москва","Санкт-Петербург","Казань"], ...overrideResponse})

export const getLookupCompaniesResponseMock = (): CompanyBrief[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()})))


export const getGetTaxonomyMockHandler = (overrideResponse?: Taxonomy | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Taxonomy> | Taxonomy), options?: RequestHandlerOptions) => {
  return http.get('*/taxonomy', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetTaxonomyResponseMock(),
      { status: 200
      })
  }, options)
}

export const getLookupCompaniesMockHandler = (overrideResponse?: CompanyBrief[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<CompanyBrief[]> | CompanyBrief[]), options?: RequestHandlerOptions) => {
  return http.get('*/companies', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getLookupCompaniesResponseMock(),
      { status: 200
      })
  }, options)
}
export const getTaxonomyMock = () => [
  getGetTaxonomyMockHandler(),
  getLookupCompaniesMockHandler()
]
