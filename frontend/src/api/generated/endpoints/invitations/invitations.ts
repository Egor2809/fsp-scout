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
  GetInvitationStatsParams,
  Invitation,
  InvitationAccept,
  InvitationCreate,
  InvitationDecline,
  InvitationNotActionableResponse,
  InvitationNote,
  InvitationPostpone,
  InvitationPrecheck,
  InvitationPrecheckRequest,
  InvitationStageUpdate,
  InvitationStats,
  ListCompanyInvitationsParams,
  ListMyInvitationsParams,
  NotFoundResponse,
  Problem,
  TooManyRequestsResponse,
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

export const getListCompanyInvitationsUrl = (params?: ListCompanyInvitationsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    const explodeParameters = ["status"];

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

  return stringifiedParams.length > 0 ? `/invitations?${stringifiedParams}` : `/invitations`
}

/**
 * @summary Инвайты компании
 */
export const listCompanyInvitations = async (params?: ListCompanyInvitationsParams, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation[]> => {

  return apiFetch<Invitation[]>(getListCompanyInvitationsUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListCompanyInvitationsQueryKey = (params?: ListCompanyInvitationsParams,) => {
    return [
    `/invitations`, ...(params ? [params] : [])
    ] as const;
    }


export const getListCompanyInvitationsQueryOptions = <TData = Awaited<ReturnType<typeof listCompanyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(params?: ListCompanyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyInvitations>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListCompanyInvitationsQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listCompanyInvitations>>> = ({ signal }) => listCompanyInvitations(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listCompanyInvitations>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListCompanyInvitationsQueryResult = NonNullable<Awaited<ReturnType<typeof listCompanyInvitations>>>
export type ListCompanyInvitationsQueryError = ErrorType<UnauthorizedResponse>


export function useListCompanyInvitations<TData = Awaited<ReturnType<typeof listCompanyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params: undefined |  ListCompanyInvitationsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyInvitations>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listCompanyInvitations>>,
          TError,
          Awaited<ReturnType<typeof listCompanyInvitations>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListCompanyInvitations<TData = Awaited<ReturnType<typeof listCompanyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListCompanyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyInvitations>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listCompanyInvitations>>,
          TError,
          Awaited<ReturnType<typeof listCompanyInvitations>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListCompanyInvitations<TData = Awaited<ReturnType<typeof listCompanyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListCompanyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyInvitations>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Инвайты компании
 */

export function useListCompanyInvitations<TData = Awaited<ReturnType<typeof listCompanyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListCompanyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyInvitations>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListCompanyInvitationsQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getCreateInvitationUrl = () => {




  return `/invitations`
}

/**
 * @summary Отправить инвайт с открытой вилкой
 */
export const createInvitation = async (invitationCreate: InvitationCreate, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

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
return apiFetch<Invitation>(getCreateInvitationUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationCreate)
  }
);}





export const getCreateInvitationMutationKey = () => ['createInvitation'] as const;

export const getCreateInvitationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createInvitation>>, TError,CreateInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createInvitation>>, TError,CreateInvitationMutationVariables, TContext> => {

const mutationKey = getCreateInvitationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createInvitation>>, CreateInvitationMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  createInvitation(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateInvitationMutationResult = NonNullable<Awaited<ReturnType<typeof createInvitation>>>
    export type CreateInvitationMutationBody = BodyType<InvitationCreate>
    export type CreateInvitationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>
    export type CreateInvitationMutationVariables = {data: BodyType<InvitationCreate>}

    /**
 * @summary Отправить инвайт с открытой вилкой
 */
export const useCreateInvitation = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createInvitation>>, TError,CreateInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createInvitation>>,
        TError,
        CreateInvitationMutationVariables,
        TContext
      > => {
      return useMutation(getCreateInvitationMutationOptions(options), queryClient);
    }
    export const getPrecheckInvitationUrl = () => {




  return `/invitations/precheck`
}

/**
 * Ответ булев, порог кандидата не раскрывается. Ограничен по частоте (не больше 10 проверок на кандидата в час).
 * @summary Проверить до отправки — вилка, квота, активный инвайт
 */
export const precheckInvitation = async (invitationPrecheckRequest: InvitationPrecheckRequest, options?: Parameters<typeof apiFetch>[1]): Promise<InvitationPrecheck> => {

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
return apiFetch<InvitationPrecheck>(getPrecheckInvitationUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationPrecheckRequest)
  }
);}





export const getPrecheckInvitationMutationKey = () => ['precheckInvitation'] as const;

export const getPrecheckInvitationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse | TooManyRequestsResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof precheckInvitation>>, TError,PrecheckInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof precheckInvitation>>, TError,PrecheckInvitationMutationVariables, TContext> => {

const mutationKey = getPrecheckInvitationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof precheckInvitation>>, PrecheckInvitationMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  precheckInvitation(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type PrecheckInvitationMutationResult = NonNullable<Awaited<ReturnType<typeof precheckInvitation>>>
    export type PrecheckInvitationMutationBody = BodyType<InvitationPrecheckRequest>
    export type PrecheckInvitationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse | TooManyRequestsResponse>
    export type PrecheckInvitationMutationVariables = {data: BodyType<InvitationPrecheckRequest>}

    /**
 * @summary Проверить до отправки — вилка, квота, активный инвайт
 */
export const usePrecheckInvitation = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse | TooManyRequestsResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof precheckInvitation>>, TError,PrecheckInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof precheckInvitation>>,
        TError,
        PrecheckInvitationMutationVariables,
        TContext
      > => {
      return useMutation(getPrecheckInvitationMutationOptions(options), queryClient);
    }
    export const getGetInvitationStatsUrl = (params?: GetInvitationStatsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/invitations/stats?${stringifiedParams}` : `/invitations/stats`
}

/**
 * @summary Воронка и причины отказов компании
 */
export const getInvitationStats = async (params?: GetInvitationStatsParams, options?: Parameters<typeof apiFetch>[1]): Promise<InvitationStats> => {

  return apiFetch<InvitationStats>(getGetInvitationStatsUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetInvitationStatsQueryKey = (params?: GetInvitationStatsParams,) => {
    return [
    `/invitations/stats`, ...(params ? [params] : [])
    ] as const;
    }


export const getGetInvitationStatsQueryOptions = <TData = Awaited<ReturnType<typeof getInvitationStats>>, TError = ErrorType<UnauthorizedResponse>>(params?: GetInvitationStatsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationStats>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetInvitationStatsQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getInvitationStats>>> = ({ signal }) => getInvitationStats(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getInvitationStats>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetInvitationStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getInvitationStats>>>
export type GetInvitationStatsQueryError = ErrorType<UnauthorizedResponse>


export function useGetInvitationStats<TData = Awaited<ReturnType<typeof getInvitationStats>>, TError = ErrorType<UnauthorizedResponse>>(
 params: undefined |  GetInvitationStatsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationStats>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getInvitationStats>>,
          TError,
          Awaited<ReturnType<typeof getInvitationStats>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetInvitationStats<TData = Awaited<ReturnType<typeof getInvitationStats>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: GetInvitationStatsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationStats>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getInvitationStats>>,
          TError,
          Awaited<ReturnType<typeof getInvitationStats>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetInvitationStats<TData = Awaited<ReturnType<typeof getInvitationStats>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: GetInvitationStatsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationStats>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Воронка и причины отказов компании
 */

export function useGetInvitationStats<TData = Awaited<ReturnType<typeof getInvitationStats>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: GetInvitationStatsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationStats>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetInvitationStatsQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getListMyInvitationsUrl = (params?: ListMyInvitationsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    const explodeParameters = ["status"];

    if (Array.isArray(value) && explodeParameters.includes(key)) {
      value.forEach((v) => {
        normalizedParams.append(key, v === null ? 'null' : String(v));
      });
      return;
    }


  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/me/invitations?${stringifiedParams}` : `/me/invitations`
}

/**
 * @summary Входящие инвайты кандидата
 */
export const listMyInvitations = async (params?: ListMyInvitationsParams, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation[]> => {

  return apiFetch<Invitation[]>(getListMyInvitationsUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListMyInvitationsQueryKey = (params?: ListMyInvitationsParams,) => {
    return [
    `/me/invitations`, ...(params ? [params] : [])
    ] as const;
    }


export const getListMyInvitationsQueryOptions = <TData = Awaited<ReturnType<typeof listMyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(params?: ListMyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyInvitations>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListMyInvitationsQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listMyInvitations>>> = ({ signal }) => listMyInvitations(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listMyInvitations>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListMyInvitationsQueryResult = NonNullable<Awaited<ReturnType<typeof listMyInvitations>>>
export type ListMyInvitationsQueryError = ErrorType<UnauthorizedResponse>


export function useListMyInvitations<TData = Awaited<ReturnType<typeof listMyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params: undefined |  ListMyInvitationsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyInvitations>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyInvitations>>,
          TError,
          Awaited<ReturnType<typeof listMyInvitations>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyInvitations<TData = Awaited<ReturnType<typeof listMyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListMyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyInvitations>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyInvitations>>,
          TError,
          Awaited<ReturnType<typeof listMyInvitations>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyInvitations<TData = Awaited<ReturnType<typeof listMyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListMyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyInvitations>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Входящие инвайты кандидата
 */

export function useListMyInvitations<TData = Awaited<ReturnType<typeof listMyInvitations>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListMyInvitationsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyInvitations>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListMyInvitationsQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetInvitationUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}`
}

/**
 * @summary Инвайт (кандидату — свой, работодателю — своей компании)
 */
export const getInvitation = async (invitationId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

  return apiFetch<Invitation>(getGetInvitationUrl(invitationId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetInvitationQueryKey = (invitationId: string,) => {
    return [
    `/invitations/${invitationId}`
    ] as const;
    }


export const getGetInvitationQueryOptions = <TData = Awaited<ReturnType<typeof getInvitation>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(invitationId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitation>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetInvitationQueryKey(invitationId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getInvitation>>> = ({ signal }) => getInvitation(invitationId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: invitationId !== null && invitationId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getInvitation>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetInvitationQueryResult = NonNullable<Awaited<ReturnType<typeof getInvitation>>>
export type GetInvitationQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetInvitation<TData = Awaited<ReturnType<typeof getInvitation>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 invitationId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitation>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getInvitation>>,
          TError,
          Awaited<ReturnType<typeof getInvitation>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetInvitation<TData = Awaited<ReturnType<typeof getInvitation>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 invitationId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitation>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getInvitation>>,
          TError,
          Awaited<ReturnType<typeof getInvitation>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetInvitation<TData = Awaited<ReturnType<typeof getInvitation>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 invitationId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitation>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Инвайт (кандидату — свой, работодателю — своей компании)
 */

export function useGetInvitation<TData = Awaited<ReturnType<typeof getInvitation>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 invitationId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitation>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetInvitationQueryOptions(invitationId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getMarkInvitationViewedUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}/view`
}

/**
 * @summary Отметить просмотр (sent → viewed, идемпотентно)
 */
export const markInvitationViewed = async (invitationId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

  return apiFetch<Invitation>(getMarkInvitationViewedUrl(invitationId),
  {
    ...options,
    method: 'POST'


  }
);}





export const getMarkInvitationViewedMutationKey = () => ['markInvitationViewed'] as const;

export const getMarkInvitationViewedMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof markInvitationViewed>>, TError,MarkInvitationViewedMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof markInvitationViewed>>, TError,MarkInvitationViewedMutationVariables, TContext> => {

const mutationKey = getMarkInvitationViewedMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof markInvitationViewed>>, MarkInvitationViewedMutationVariables> = (props) => {
          const {invitationId} = props ?? {};

          return  markInvitationViewed(invitationId,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type MarkInvitationViewedMutationResult = NonNullable<Awaited<ReturnType<typeof markInvitationViewed>>>

    export type MarkInvitationViewedMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse>
    export type MarkInvitationViewedMutationVariables = {invitationId: string}

    /**
 * @summary Отметить просмотр (sent → viewed, идемпотентно)
 */
export const useMarkInvitationViewed = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof markInvitationViewed>>, TError,MarkInvitationViewedMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof markInvitationViewed>>,
        TError,
        MarkInvitationViewedMutationVariables,
        TContext
      > => {
      return useMutation(getMarkInvitationViewedMutationOptions(options), queryClient);
    }
    export const getAcceptInvitationUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}/accept`
}

/**
 * @summary Принять — контакты раскрываются компании
 */
export const acceptInvitation = async (invitationId: string,
    invitationAccept: InvitationAccept, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

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
return apiFetch<Invitation>(getAcceptInvitationUrl(invitationId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationAccept)
  }
);}





export const getAcceptInvitationMutationKey = () => ['acceptInvitation'] as const;

export const getAcceptInvitationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof acceptInvitation>>, TError,AcceptInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof acceptInvitation>>, TError,AcceptInvitationMutationVariables, TContext> => {

const mutationKey = getAcceptInvitationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof acceptInvitation>>, AcceptInvitationMutationVariables> = (props) => {
          const {invitationId,data} = props ?? {};

          return  acceptInvitation(invitationId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type AcceptInvitationMutationResult = NonNullable<Awaited<ReturnType<typeof acceptInvitation>>>
    export type AcceptInvitationMutationBody = BodyType<InvitationAccept>
    export type AcceptInvitationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse | ValidationErrorResponse>
    export type AcceptInvitationMutationVariables = {invitationId: string;data: BodyType<InvitationAccept>}

    /**
 * @summary Принять — контакты раскрываются компании
 */
export const useAcceptInvitation = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof acceptInvitation>>, TError,AcceptInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof acceptInvitation>>,
        TError,
        AcceptInvitationMutationVariables,
        TContext
      > => {
      return useMutation(getAcceptInvitationMutationOptions(options), queryClient);
    }
    export const getDeclineInvitationUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}/decline`
}

/**
 * @summary Отклонить с причиной
 */
export const declineInvitation = async (invitationId: string,
    invitationDecline: InvitationDecline, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

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
return apiFetch<Invitation>(getDeclineInvitationUrl(invitationId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationDecline)
  }
);}





export const getDeclineInvitationMutationKey = () => ['declineInvitation'] as const;

export const getDeclineInvitationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof declineInvitation>>, TError,DeclineInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof declineInvitation>>, TError,DeclineInvitationMutationVariables, TContext> => {

const mutationKey = getDeclineInvitationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof declineInvitation>>, DeclineInvitationMutationVariables> = (props) => {
          const {invitationId,data} = props ?? {};

          return  declineInvitation(invitationId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeclineInvitationMutationResult = NonNullable<Awaited<ReturnType<typeof declineInvitation>>>
    export type DeclineInvitationMutationBody = BodyType<InvitationDecline>
    export type DeclineInvitationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse | ValidationErrorResponse>
    export type DeclineInvitationMutationVariables = {invitationId: string;data: BodyType<InvitationDecline>}

    /**
 * @summary Отклонить с причиной
 */
export const useDeclineInvitation = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof declineInvitation>>, TError,DeclineInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof declineInvitation>>,
        TError,
        DeclineInvitationMutationVariables,
        TContext
      > => {
      return useMutation(getDeclineInvitationMutationOptions(options), queryClient);
    }
    export const getPostponeInvitationUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}/postpone`
}

/**
 * @summary «Не сейчас» — отложить до срока ответа (один раз)
 */
export const postponeInvitation = async (invitationId: string,
    invitationPostpone?: InvitationPostpone, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

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
return apiFetch<Invitation>(getPostponeInvitationUrl(invitationId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationPostpone)
  }
);}





export const getPostponeInvitationMutationKey = () => ['postponeInvitation'] as const;

export const getPostponeInvitationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postponeInvitation>>, TError,PostponeInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof postponeInvitation>>, TError,PostponeInvitationMutationVariables, TContext> => {

const mutationKey = getPostponeInvitationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof postponeInvitation>>, PostponeInvitationMutationVariables> = (props) => {
          const {invitationId,data} = props ?? {};

          return  postponeInvitation(invitationId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type PostponeInvitationMutationResult = NonNullable<Awaited<ReturnType<typeof postponeInvitation>>>
    export type PostponeInvitationMutationBody = BodyType<InvitationPostpone> | undefined
    export type PostponeInvitationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>
    export type PostponeInvitationMutationVariables = {invitationId: string;data?: BodyType<InvitationPostpone>}

    /**
 * @summary «Не сейчас» — отложить до срока ответа (один раз)
 */
export const usePostponeInvitation = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postponeInvitation>>, TError,PostponeInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof postponeInvitation>>,
        TError,
        PostponeInvitationMutationVariables,
        TContext
      > => {
      return useMutation(getPostponeInvitationMutationOptions(options), queryClient);
    }
    export const getWithdrawInvitationUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}/withdraw`
}

/**
 * @summary Отозвать активный инвайт
 */
export const withdrawInvitation = async (invitationId: string,
    invitationNote?: InvitationNote, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

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
return apiFetch<Invitation>(getWithdrawInvitationUrl(invitationId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationNote)
  }
);}





export const getWithdrawInvitationMutationKey = () => ['withdrawInvitation'] as const;

export const getWithdrawInvitationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof withdrawInvitation>>, TError,WithdrawInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof withdrawInvitation>>, TError,WithdrawInvitationMutationVariables, TContext> => {

const mutationKey = getWithdrawInvitationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof withdrawInvitation>>, WithdrawInvitationMutationVariables> = (props) => {
          const {invitationId,data} = props ?? {};

          return  withdrawInvitation(invitationId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type WithdrawInvitationMutationResult = NonNullable<Awaited<ReturnType<typeof withdrawInvitation>>>
    export type WithdrawInvitationMutationBody = BodyType<InvitationNote> | undefined
    export type WithdrawInvitationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>
    export type WithdrawInvitationMutationVariables = {invitationId: string;data?: BodyType<InvitationNote>}

    /**
 * @summary Отозвать активный инвайт
 */
export const useWithdrawInvitation = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof withdrawInvitation>>, TError,WithdrawInvitationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof withdrawInvitation>>,
        TError,
        WithdrawInvitationMutationVariables,
        TContext
      > => {
      return useMutation(getWithdrawInvitationMutationOptions(options), queryClient);
    }
    export const getUpdateInvitationStageUrl = (invitationId: string,) => {




  return `/invitations/${invitationId}/stage`
}

/**
 * @summary Продвинуть после принятия (interview → offer → hired | closed)
 */
export const updateInvitationStage = async (invitationId: string,
    invitationStageUpdate: InvitationStageUpdate, options?: Parameters<typeof apiFetch>[1]): Promise<Invitation> => {

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
return apiFetch<Invitation>(getUpdateInvitationStageUrl(invitationId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(invitationStageUpdate)
  }
);}





export const getUpdateInvitationStageMutationKey = () => ['updateInvitationStage'] as const;

export const getUpdateInvitationStageMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateInvitationStage>>, TError,UpdateInvitationStageMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateInvitationStage>>, TError,UpdateInvitationStageMutationVariables, TContext> => {

const mutationKey = getUpdateInvitationStageMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateInvitationStage>>, UpdateInvitationStageMutationVariables> = (props) => {
          const {invitationId,data} = props ?? {};

          return  updateInvitationStage(invitationId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateInvitationStageMutationResult = NonNullable<Awaited<ReturnType<typeof updateInvitationStage>>>
    export type UpdateInvitationStageMutationBody = BodyType<InvitationStageUpdate>
    export type UpdateInvitationStageMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>
    export type UpdateInvitationStageMutationVariables = {invitationId: string;data: BodyType<InvitationStageUpdate>}

    /**
 * @summary Продвинуть после принятия (interview → offer → hired | closed)
 */
export const useUpdateInvitationStage = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | InvitationNotActionableResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateInvitationStage>>, TError,UpdateInvitationStageMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateInvitationStage>>,
        TError,
        UpdateInvitationStageMutationVariables,
        TContext
      > => {
      return useMutation(getUpdateInvitationStageMutationOptions(options), queryClient);
    }
