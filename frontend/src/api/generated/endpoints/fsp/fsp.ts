/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import {
  useMutation,
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  ConflictResponse,
  ConsentRequiredResponse,
  FspLinkRequest,
  FspProfile,
  NotFoundResponse,
  UnauthorizedResponse
} from '../../model';

import { apiFetch } from '../../../http';
import type { ErrorType , BodyType } from '../../../http';


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

export const getGetMyFspUrl = () => {




  return `/me/fsp`
}

/**
 * Если ФСП ID не привязан или истории нет, приходит `linked`/`has_history` = false, `index` = 0, `bonus` = 0 — это нормальный нейтральный случай, не ошибка.
 * @summary Мой профиль ФСП (достижения, индекс, разбивка)
 */
export const getMyFsp = async ( options?: Parameters<typeof apiFetch>[1]): Promise<FspProfile> => {

  return apiFetch<FspProfile>(getGetMyFspUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMyFspQueryKey = () => {
    return [
    `/me/fsp`
    ] as const;
    }


export const getGetMyFspQueryOptions = <TData = Awaited<ReturnType<typeof getMyFsp>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyFsp>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMyFspQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMyFsp>>> = ({ signal }) => getMyFsp({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMyFsp>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMyFspQueryResult = NonNullable<Awaited<ReturnType<typeof getMyFsp>>>
export type GetMyFspQueryError = ErrorType<UnauthorizedResponse>


export function useGetMyFsp<TData = Awaited<ReturnType<typeof getMyFsp>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyFsp>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyFsp>>,
          TError,
          Awaited<ReturnType<typeof getMyFsp>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyFsp<TData = Awaited<ReturnType<typeof getMyFsp>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyFsp>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyFsp>>,
          TError,
          Awaited<ReturnType<typeof getMyFsp>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyFsp<TData = Awaited<ReturnType<typeof getMyFsp>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyFsp>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Мой профиль ФСП (достижения, индекс, разбивка)
 */

export function useGetMyFsp<TData = Awaited<ReturnType<typeof getMyFsp>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyFsp>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMyFspQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getLinkMyFspUrl = () => {




  return `/me/fsp/link`
}

/**
 * В проде привязка идёт через client-initiated account linking Keycloak (IdP `fsp`),
 * `fsp_id` сверяется с брокерской связью. Нужен `fsp_data` в согласиях (`403 consent_required`).
 * @summary Привязать ФСП ID и подтянуть достижения
 */
export const linkMyFsp = async (fspLinkRequest: FspLinkRequest, options?: Parameters<typeof apiFetch>[1]): Promise<FspProfile> => {

    const getHeaders = (h?: NonNullable<RequestInit['headers']>): Record<string, string | readonly string[]> => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h as Iterable<Iterable<string>>, (entry) => Array.from(entry) as [string, string]),
      );
    }
    const headers: Record<string, string | readonly string[]> = {};
    for (const [name, value] of Object.entries<string | readonly string[] | undefined>(h)) {
      if (value !== undefined) headers[name] = value;
    }
    return headers;
  };
return apiFetch<FspProfile>(getLinkMyFspUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(fspLinkRequest)
  }
);}





export const getLinkMyFspMutationKey = () => ['linkMyFsp'] as const;

export const getLinkMyFspMutationOptions = <TError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | NotFoundResponse | ConflictResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof linkMyFsp>>, TError,LinkMyFspMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof linkMyFsp>>, TError,LinkMyFspMutationVariables, TContext> => {

const mutationKey = getLinkMyFspMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof linkMyFsp>>, LinkMyFspMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  linkMyFsp(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type LinkMyFspMutationResult = NonNullable<Awaited<ReturnType<typeof linkMyFsp>>>
    export type LinkMyFspMutationBody = BodyType<FspLinkRequest>
    export type LinkMyFspMutationError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | NotFoundResponse | ConflictResponse>
    export type LinkMyFspMutationVariables = {data: BodyType<FspLinkRequest>}

    /**
 * @summary Привязать ФСП ID и подтянуть достижения
 */
export const useLinkMyFsp = <TError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | NotFoundResponse | ConflictResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof linkMyFsp>>, TError,LinkMyFspMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof linkMyFsp>>,
        TError,
        LinkMyFspMutationVariables,
        TContext
      > => {
      return useMutation(getLinkMyFspMutationOptions(options), queryClient);
    }
    export const getUnlinkMyFspUrl = () => {




  return `/me/fsp/link`
}

/**
 * @summary Отвязать ФСП ID (достижения перестают учитываться)
 */
export const unlinkMyFsp = async ( options?: Parameters<typeof apiFetch>[1]): Promise<FspProfile> => {

  return apiFetch<FspProfile>(getUnlinkMyFspUrl(),
  {
    ...options,
    method: 'DELETE'


  }
);}





export const getUnlinkMyFspMutationKey = () => ['unlinkMyFsp'] as const;

export const getUnlinkMyFspMutationOptions = <TError = ErrorType<UnauthorizedResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof unlinkMyFsp>>, TError,void, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof unlinkMyFsp>>, TError,void, TContext> => {

const mutationKey = getUnlinkMyFspMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof unlinkMyFsp>>, void> = () => {


          return  unlinkMyFsp(requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UnlinkMyFspMutationResult = NonNullable<Awaited<ReturnType<typeof unlinkMyFsp>>>

    export type UnlinkMyFspMutationError = ErrorType<UnauthorizedResponse>


    /**
 * @summary Отвязать ФСП ID (достижения перестают учитываться)
 */
export const useUnlinkMyFsp = <TError = ErrorType<UnauthorizedResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof unlinkMyFsp>>, TError,void, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof unlinkMyFsp>>,
        TError,
        void,
        TContext
      > => {
      return useMutation(getUnlinkMyFspMutationOptions(options), queryClient);
    }
