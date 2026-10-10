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
  GetSalaryRadarParams,
  Need,
  NeedCategories,
  NeedConfirm,
  NeedCreate,
  NotFoundResponse,
  Problem,
  SalaryRadar,
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

export const getCreateNeedUrl = () => {




  return `/needs`
}

/**
 * Текст разбирается в чипы (специализация, грейд, must/nice-навыки, формат, город, отрасль, вилка, если указана).
 * LLM работает с маскированием ПДн, без ключей — фолбэк на правилах и словаре синонимов.
 * Потребность создаётся черновиком; рекомендации доступны после подтверждения `PUT /needs/{need_id}`
 * с обязательной вилкой.
 * @summary Разобрать потребность из свободного текста
 */
export const createNeed = async (needCreate: NeedCreate, options?: Parameters<typeof apiFetch>[1]): Promise<Need> => {

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
return apiFetch<Need>(getCreateNeedUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(needCreate)
  }
);}





export const getCreateNeedMutationKey = () => ['createNeed'] as const;

export const getCreateNeedMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createNeed>>, TError,CreateNeedMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createNeed>>, TError,CreateNeedMutationVariables, TContext> => {

const mutationKey = getCreateNeedMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createNeed>>, CreateNeedMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  createNeed(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateNeedMutationResult = NonNullable<Awaited<ReturnType<typeof createNeed>>>
    export type CreateNeedMutationBody = BodyType<NeedCreate>
    export type CreateNeedMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type CreateNeedMutationVariables = {data: BodyType<NeedCreate>}

    /**
 * @summary Разобрать потребность из свободного текста
 */
export const useCreateNeed = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createNeed>>, TError,CreateNeedMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createNeed>>,
        TError,
        CreateNeedMutationVariables,
        TContext
      > => {
      return useMutation(getCreateNeedMutationOptions(options), queryClient);
    }
    export const getGetNeedUrl = (needId: string,) => {




  return `/needs/${needId}`
}

/**
 * @summary Потребность
 */
export const getNeed = async (needId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Need> => {

  return apiFetch<Need>(getGetNeedUrl(needId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetNeedQueryKey = (needId: string,) => {
    return [
    `/needs/${needId}`
    ] as const;
    }


export const getGetNeedQueryOptions = <TData = Awaited<ReturnType<typeof getNeed>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeed>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetNeedQueryKey(needId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getNeed>>> = ({ signal }) => getNeed(needId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: needId !== null && needId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getNeed>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetNeedQueryResult = NonNullable<Awaited<ReturnType<typeof getNeed>>>
export type GetNeedQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetNeed<TData = Awaited<ReturnType<typeof getNeed>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 needId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeed>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getNeed>>,
          TError,
          Awaited<ReturnType<typeof getNeed>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetNeed<TData = Awaited<ReturnType<typeof getNeed>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeed>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getNeed>>,
          TError,
          Awaited<ReturnType<typeof getNeed>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetNeed<TData = Awaited<ReturnType<typeof getNeed>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeed>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Потребность
 */

export function useGetNeed<TData = Awaited<ReturnType<typeof getNeed>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeed>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetNeedQueryOptions(needId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getConfirmNeedUrl = (needId: string,) => {




  return `/needs/${needId}`
}

/**
 * @summary Подтвердить отредактированные чипы и вилку
 */
export const confirmNeed = async (needId: string,
    needConfirm: NeedConfirm, options?: Parameters<typeof apiFetch>[1]): Promise<Need> => {

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
return apiFetch<Need>(getConfirmNeedUrl(needId),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(needConfirm)
  }
);}





export const getConfirmNeedMutationKey = () => ['confirmNeed'] as const;

export const getConfirmNeedMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof confirmNeed>>, TError,ConfirmNeedMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof confirmNeed>>, TError,ConfirmNeedMutationVariables, TContext> => {

const mutationKey = getConfirmNeedMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof confirmNeed>>, ConfirmNeedMutationVariables> = (props) => {
          const {needId,data} = props ?? {};

          return  confirmNeed(needId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type ConfirmNeedMutationResult = NonNullable<Awaited<ReturnType<typeof confirmNeed>>>
    export type ConfirmNeedMutationBody = BodyType<NeedConfirm>
    export type ConfirmNeedMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>
    export type ConfirmNeedMutationVariables = {needId: string;data: BodyType<NeedConfirm>}

    /**
 * @summary Подтвердить отредактированные чипы и вилку
 */
export const useConfirmNeed = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof confirmNeed>>, TError,ConfirmNeedMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof confirmNeed>>,
        TError,
        ConfirmNeedMutationVariables,
        TContext
      > => {
      return useMutation(getConfirmNeedMutationOptions(options), queryClient);
    }
    export const getGetNeedCategoriesUrl = (needId: string,) => {




  return `/needs/${needId}/categories`
}

/**
 * @summary Рекомендованные категории с числом кандидатов и салари-радаром
 */
export const getNeedCategories = async (needId: string, options?: Parameters<typeof apiFetch>[1]): Promise<NeedCategories> => {

  return apiFetch<NeedCategories>(getGetNeedCategoriesUrl(needId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetNeedCategoriesQueryKey = (needId: string,) => {
    return [
    `/needs/${needId}/categories`
    ] as const;
    }


export const getGetNeedCategoriesQueryOptions = <TData = Awaited<ReturnType<typeof getNeedCategories>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>>(needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeedCategories>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetNeedCategoriesQueryKey(needId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getNeedCategories>>> = ({ signal }) => getNeedCategories(needId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: needId !== null && needId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getNeedCategories>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetNeedCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof getNeedCategories>>>
export type GetNeedCategoriesQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>


export function useGetNeedCategories<TData = Awaited<ReturnType<typeof getNeedCategories>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>>(
 needId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeedCategories>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getNeedCategories>>,
          TError,
          Awaited<ReturnType<typeof getNeedCategories>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetNeedCategories<TData = Awaited<ReturnType<typeof getNeedCategories>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>>(
 needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeedCategories>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getNeedCategories>>,
          TError,
          Awaited<ReturnType<typeof getNeedCategories>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetNeedCategories<TData = Awaited<ReturnType<typeof getNeedCategories>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>>(
 needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeedCategories>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Рекомендованные категории с числом кандидатов и салари-радаром
 */

export function useGetNeedCategories<TData = Awaited<ReturnType<typeof getNeedCategories>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>>(
 needId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNeedCategories>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetNeedCategoriesQueryOptions(needId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetSalaryRadarUrl = (params: GetSalaryRadarParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/salary-radar?${stringifiedParams}` : `/salary-radar`
}

/**
 * @summary Салари-радар для категории и вилки
 */
export const getSalaryRadar = async (params: GetSalaryRadarParams, options?: Parameters<typeof apiFetch>[1]): Promise<SalaryRadar> => {

  return apiFetch<SalaryRadar>(getGetSalaryRadarUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetSalaryRadarQueryKey = (params?: GetSalaryRadarParams,) => {
    return [
    `/salary-radar`, ...(params ? [params] : [])
    ] as const;
    }


export const getGetSalaryRadarQueryOptions = <TData = Awaited<ReturnType<typeof getSalaryRadar>>, TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>>(params: GetSalaryRadarParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSalaryRadar>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetSalaryRadarQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getSalaryRadar>>> = ({ signal }) => getSalaryRadar(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getSalaryRadar>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetSalaryRadarQueryResult = NonNullable<Awaited<ReturnType<typeof getSalaryRadar>>>
export type GetSalaryRadarQueryError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>


export function useGetSalaryRadar<TData = Awaited<ReturnType<typeof getSalaryRadar>>, TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>>(
 params: GetSalaryRadarParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSalaryRadar>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSalaryRadar>>,
          TError,
          Awaited<ReturnType<typeof getSalaryRadar>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSalaryRadar<TData = Awaited<ReturnType<typeof getSalaryRadar>>, TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>>(
 params: GetSalaryRadarParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSalaryRadar>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSalaryRadar>>,
          TError,
          Awaited<ReturnType<typeof getSalaryRadar>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSalaryRadar<TData = Awaited<ReturnType<typeof getSalaryRadar>>, TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>>(
 params: GetSalaryRadarParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSalaryRadar>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Салари-радар для категории и вилки
 */

export function useGetSalaryRadar<TData = Awaited<ReturnType<typeof getSalaryRadar>>, TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>>(
 params: GetSalaryRadarParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSalaryRadar>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetSalaryRadarQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






