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
  EvalRankRequest,
  EvalRankResponse,
  FspWebhookEvent,
  NotFoundResponse,
  ProfileVerification,
  UnauthorizedResponse,
  ValidationErrorResponse
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

export const getVerifyProfileUrl = (profileToken: string,) => {




  return `/verify/${profileToken}`
}

/**
 * @summary Проверка подлинности PDF-профиля по QR
 */
export const verifyProfile = async (profileToken: string, options?: Parameters<typeof apiFetch>[1]): Promise<ProfileVerification> => {

  return apiFetch<ProfileVerification>(getVerifyProfileUrl(profileToken),
  {
    ...options,
    method: 'GET'


  }
);}





export const getVerifyProfileQueryKey = (profileToken: string,) => {
    return [
    `/verify/${profileToken}`
    ] as const;
    }


export const getVerifyProfileQueryOptions = <TData = Awaited<ReturnType<typeof verifyProfile>>, TError = ErrorType<NotFoundResponse>>(profileToken: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof verifyProfile>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getVerifyProfileQueryKey(profileToken);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof verifyProfile>>> = ({ signal }) => verifyProfile(profileToken, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: profileToken !== null && profileToken !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof verifyProfile>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type VerifyProfileQueryResult = NonNullable<Awaited<ReturnType<typeof verifyProfile>>>
export type VerifyProfileQueryError = ErrorType<NotFoundResponse>


export function useVerifyProfile<TData = Awaited<ReturnType<typeof verifyProfile>>, TError = ErrorType<NotFoundResponse>>(
 profileToken: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof verifyProfile>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof verifyProfile>>,
          TError,
          Awaited<ReturnType<typeof verifyProfile>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useVerifyProfile<TData = Awaited<ReturnType<typeof verifyProfile>>, TError = ErrorType<NotFoundResponse>>(
 profileToken: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof verifyProfile>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof verifyProfile>>,
          TError,
          Awaited<ReturnType<typeof verifyProfile>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useVerifyProfile<TData = Awaited<ReturnType<typeof verifyProfile>>, TError = ErrorType<NotFoundResponse>>(
 profileToken: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof verifyProfile>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Проверка подлинности PDF-профиля по QR
 */

export function useVerifyProfile<TData = Awaited<ReturnType<typeof verifyProfile>>, TError = ErrorType<NotFoundResponse>>(
 profileToken: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof verifyProfile>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getVerifyProfileQueryOptions(profileToken,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getEvalRankUrl = () => {




  return `/eval/rank`
}

/**
 * Отдаёт top-K с объяснениями. `Accept: text/csv` — тот же результат в CSV.
 * @summary Режим проверки жюри — ранжирование внешних пар «вакансия–кандидат»
 */
export const evalRank = async (evalRankRequest: EvalRankRequest, options?: Parameters<typeof apiFetch>[1]): Promise<EvalRankResponse | string> => {

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
return apiFetch<EvalRankResponse | string>(getEvalRankUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(evalRankRequest)
  }
);}





export const getEvalRankMutationKey = () => ['evalRank'] as const;

export const getEvalRankMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof evalRank>>, TError,EvalRankMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof evalRank>>, TError,EvalRankMutationVariables, TContext> => {

const mutationKey = getEvalRankMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof evalRank>>, EvalRankMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  evalRank(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type EvalRankMutationResult = NonNullable<Awaited<ReturnType<typeof evalRank>>>
    export type EvalRankMutationBody = BodyType<EvalRankRequest>
    export type EvalRankMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type EvalRankMutationVariables = {data: BodyType<EvalRankRequest>}

    /**
 * @summary Режим проверки жюри — ранжирование внешних пар «вакансия–кандидат»
 */
export const useEvalRank = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof evalRank>>, TError,EvalRankMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof evalRank>>,
        TError,
        EvalRankMutationVariables,
        TContext
      > => {
      return useMutation(getEvalRankMutationOptions(options), queryClient);
    }
    export const getFspWebhookUrl = () => {




  return `/webhooks/fsp`
}

/**
 * @summary Вебхук реестра ФСП (achievement.created)
 */
export const fspWebhook = async (fspWebhookEvent: FspWebhookEvent, options?: Parameters<typeof apiFetch>[1]): Promise<void> => {

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
return apiFetch<void>(getFspWebhookUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(fspWebhookEvent)
  }
);}





export const getFspWebhookMutationKey = () => ['fspWebhook'] as const;

export const getFspWebhookMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof fspWebhook>>, TError,FspWebhookMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof fspWebhook>>, TError,FspWebhookMutationVariables, TContext> => {

const mutationKey = getFspWebhookMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof fspWebhook>>, FspWebhookMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  fspWebhook(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type FspWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof fspWebhook>>>
    export type FspWebhookMutationBody = BodyType<FspWebhookEvent>
    export type FspWebhookMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type FspWebhookMutationVariables = {data: BodyType<FspWebhookEvent>}

    /**
 * @summary Вебхук реестра ФСП (achievement.created)
 */
export const useFspWebhook = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof fspWebhook>>, TError,FspWebhookMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof fspWebhook>>,
        TError,
        FspWebhookMutationVariables,
        TContext
      > => {
      return useMutation(getFspWebhookMutationOptions(options), queryClient);
    }
