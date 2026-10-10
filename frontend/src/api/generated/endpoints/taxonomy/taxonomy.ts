/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import {
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  CompanyBrief,
  LookupCompaniesParams,
  Taxonomy,
  TooManyRequestsResponse,
  UnauthorizedResponse
} from '../../model';

import { apiFetch } from '../../../http';
import type { ErrorType } from '../../../http';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



const withQueryKey = <T extends object, K>(query: T, queryKey: K): T & { queryKey: K } => {
  const result = { queryKey } as T & { queryKey: K };
  for (const key of Object.keys(query)) {
    // The explicit queryKey always wins, matching the previous
    // `{ ...query, queryKey }` spread where it was set last.
    if (key === 'queryKey') continue;
    Object.defineProperty(result, key, {
      enumerable: true,
      configurable: true,
      get: () => (query as Record<string, unknown>)[key],
    });
  }
  return result;
};

export const getGetTaxonomyUrl = () => {




  return `/taxonomy`
}

/**
 * @summary Справочники (специализации, грейды, отрасли, навыки с синонимами, города)
 */
export const getTaxonomy = async ( options?: Parameters<typeof apiFetch>[1]): Promise<Taxonomy> => {

  return apiFetch<Taxonomy>(getGetTaxonomyUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetTaxonomyQueryKey = () => {
    return [
    `/taxonomy`
    ] as const;
    }


export const getGetTaxonomyQueryOptions = <TData = Awaited<ReturnType<typeof getTaxonomy>>, TError = ErrorType<TooManyRequestsResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTaxonomy>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetTaxonomyQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getTaxonomy>>> = ({ signal }) => getTaxonomy({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getTaxonomy>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetTaxonomyQueryResult = NonNullable<Awaited<ReturnType<typeof getTaxonomy>>>
export type GetTaxonomyQueryError = ErrorType<TooManyRequestsResponse>


export function useGetTaxonomy<TData = Awaited<ReturnType<typeof getTaxonomy>>, TError = ErrorType<TooManyRequestsResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTaxonomy>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getTaxonomy>>,
          TError,
          Awaited<ReturnType<typeof getTaxonomy>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetTaxonomy<TData = Awaited<ReturnType<typeof getTaxonomy>>, TError = ErrorType<TooManyRequestsResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTaxonomy>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getTaxonomy>>,
          TError,
          Awaited<ReturnType<typeof getTaxonomy>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetTaxonomy<TData = Awaited<ReturnType<typeof getTaxonomy>>, TError = ErrorType<TooManyRequestsResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTaxonomy>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Справочники (специализации, грейды, отрасли, навыки с синонимами, города)
 */

export function useGetTaxonomy<TData = Awaited<ReturnType<typeof getTaxonomy>>, TError = ErrorType<TooManyRequestsResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTaxonomy>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetTaxonomyQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getLookupCompaniesUrl = (params?: LookupCompaniesParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/companies?${stringifiedParams}` : `/companies`
}

/**
 * @summary Поиск компаний (для списка «скрыть профиль от компаний»)
 */
export const lookupCompanies = async (params?: LookupCompaniesParams, options?: Parameters<typeof apiFetch>[1]): Promise<CompanyBrief[]> => {

  return apiFetch<CompanyBrief[]>(getLookupCompaniesUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getLookupCompaniesQueryKey = (params?: LookupCompaniesParams,) => {
    return [
    `/companies`, ...(params ? [params] : [])
    ] as const;
    }


export const getLookupCompaniesQueryOptions = <TData = Awaited<ReturnType<typeof lookupCompanies>>, TError = ErrorType<UnauthorizedResponse>>(params?: LookupCompaniesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof lookupCompanies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getLookupCompaniesQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof lookupCompanies>>> = ({ signal }) => lookupCompanies(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof lookupCompanies>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type LookupCompaniesQueryResult = NonNullable<Awaited<ReturnType<typeof lookupCompanies>>>
export type LookupCompaniesQueryError = ErrorType<UnauthorizedResponse>


export function useLookupCompanies<TData = Awaited<ReturnType<typeof lookupCompanies>>, TError = ErrorType<UnauthorizedResponse>>(
 params: undefined |  LookupCompaniesParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof lookupCompanies>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof lookupCompanies>>,
          TError,
          Awaited<ReturnType<typeof lookupCompanies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useLookupCompanies<TData = Awaited<ReturnType<typeof lookupCompanies>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: LookupCompaniesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof lookupCompanies>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof lookupCompanies>>,
          TError,
          Awaited<ReturnType<typeof lookupCompanies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useLookupCompanies<TData = Awaited<ReturnType<typeof lookupCompanies>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: LookupCompaniesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof lookupCompanies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Поиск компаний (для списка «скрыть профиль от компаний»)
 */

export function useLookupCompanies<TData = Awaited<ReturnType<typeof lookupCompanies>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: LookupCompaniesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof lookupCompanies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getLookupCompaniesQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






