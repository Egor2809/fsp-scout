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
  CandidateDetail,
  CandidatePage,
  GetCandidateParams,
  ListCandidatesParams,
  NotFoundResponse,
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

export const getListCandidatesUrl = (params?: ListCandidatesParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    const explodeParameters = ["grade","skill","work_format"];

    if (Array.isArray(value) && explodeParameters.includes(key)) {
      value.forEach((v) => {
        normalizedParams.append(key, v === null ? 'null' : String(v));
      });
      return;
    }

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/candidates?${stringifiedParams}` : `/candidates`
}

/**
 * @summary Банк кандидатов с фильтрами (анонимные карточки)
 */
export const listCandidates = async (params?: ListCandidatesParams, options?: Parameters<typeof apiFetch>[1]): Promise<CandidatePage> => {

  return apiFetch<CandidatePage>(getListCandidatesUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListCandidatesQueryKey = (params?: ListCandidatesParams,) => {
    return [
    `/candidates`, ...(params ? [params] : [])
    ] as const;
    }


export const getListCandidatesQueryOptions = <TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<UnauthorizedResponse>>(params?: ListCandidatesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListCandidatesQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listCandidates>>> = ({ signal }) => listCandidates(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListCandidatesQueryResult = NonNullable<Awaited<ReturnType<typeof listCandidates>>>
export type ListCandidatesQueryError = ErrorType<UnauthorizedResponse>


export function useListCandidates<TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<UnauthorizedResponse>>(
 params: undefined |  ListCandidatesParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listCandidates>>,
          TError,
          Awaited<ReturnType<typeof listCandidates>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListCandidates<TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListCandidatesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listCandidates>>,
          TError,
          Awaited<ReturnType<typeof listCandidates>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListCandidates<TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListCandidatesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Банк кандидатов с фильтрами (анонимные карточки)
 */

export function useListCandidates<TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListCandidatesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListCandidatesQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetCandidateUrl = (candidateId: string,
    params?: GetCandidateParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/candidates/${candidateId}?${stringifiedParams}` : `/candidates/${candidateId}`
}

/**
 * `contacts` заполнен, только если `disclosure.revealed = true` для компании текущего пользователя.
 * @summary Карточка кандидата (анонимная или раскрытая)
 */
export const getCandidate = async (candidateId: string,
    params?: GetCandidateParams, options?: Parameters<typeof apiFetch>[1]): Promise<CandidateDetail> => {

  return apiFetch<CandidateDetail>(getGetCandidateUrl(candidateId,params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetCandidateQueryKey = (candidateId: string,
    params?: GetCandidateParams,) => {
    return [
    `/candidates/${candidateId}`, ...(params ? [params] : [])
    ] as const;
    }


export const getGetCandidateQueryOptions = <TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(candidateId: string,
    params?: GetCandidateParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetCandidateQueryKey(candidateId,params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getCandidate>>> = ({ signal }) => getCandidate(candidateId,params, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: candidateId !== null && candidateId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetCandidateQueryResult = NonNullable<Awaited<ReturnType<typeof getCandidate>>>
export type GetCandidateQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetCandidate<TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 candidateId: string,
    params: undefined |  GetCandidateParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getCandidate>>,
          TError,
          Awaited<ReturnType<typeof getCandidate>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetCandidate<TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 candidateId: string,
    params?: GetCandidateParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getCandidate>>,
          TError,
          Awaited<ReturnType<typeof getCandidate>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetCandidate<TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 candidateId: string,
    params?: GetCandidateParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Карточка кандидата (анонимная или раскрытая)
 */

export function useGetCandidate<TData = Awaited<ReturnType<typeof getCandidate>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 candidateId: string,
    params?: GetCandidateParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCandidate>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetCandidateQueryOptions(candidateId,params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






