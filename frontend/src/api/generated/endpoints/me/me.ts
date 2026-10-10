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
  AccountDeletion,
  ConsentState,
  ConsentsUpdate,
  CurrentUser,
  ExportMyData200,
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

export const getGetMeUrl = () => {




  return `/me`
}

/**
 * Создаёт пользователя при первом обращении. Для кандидата возвращает состояние онбординга, для работодателя — компанию.
 * @summary Текущий пользователь
 */
export const getMe = async ( options?: Parameters<typeof apiFetch>[1]): Promise<CurrentUser> => {

  return apiFetch<CurrentUser>(getGetMeUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMeQueryKey = () => {
    return [
    `/me`
    ] as const;
    }


export const getGetMeQueryOptions = <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMeQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMe>>> = ({ signal }) => getMe({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>
export type GetMeQueryError = ErrorType<UnauthorizedResponse>


export function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMe>>,
          TError,
          Awaited<ReturnType<typeof getMe>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMe>>,
          TError,
          Awaited<ReturnType<typeof getMe>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Текущий пользователь
 */

export function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMeQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getDeleteMeUrl = () => {




  return `/me`
}

/**
 * Запускает удаление аккаунта и всех персональных данных (152-ФЗ). Профиль сразу скрывается из выдачи.
 * @summary Удалить аккаунт и данные
 */
export const deleteMe = async ( options?: Parameters<typeof apiFetch>[1]): Promise<AccountDeletion> => {

  return apiFetch<AccountDeletion>(getDeleteMeUrl(),
  {
    ...options,
    method: 'DELETE'


  }
);}





export const getDeleteMeMutationKey = () => ['deleteMe'] as const;

export const getDeleteMeMutationOptions = <TError = ErrorType<UnauthorizedResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteMe>>, TError,void, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteMe>>, TError,void, TContext> => {

const mutationKey = getDeleteMeMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteMe>>, void> = () => {


          return  deleteMe(requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeleteMeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMe>>>

    export type DeleteMeMutationError = ErrorType<UnauthorizedResponse>


    /**
 * @summary Удалить аккаунт и данные
 */
export const useDeleteMe = <TError = ErrorType<UnauthorizedResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteMe>>, TError,void, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteMe>>,
        TError,
        void,
        TContext
      > => {
      return useMutation(getDeleteMeMutationOptions(options), queryClient);
    }
    export const getExportMyDataUrl = () => {




  return `/me/export`
}

/**
 * @summary Экспорт своих данных (JSON)
 */
export const exportMyData = async ( options?: Parameters<typeof apiFetch>[1]): Promise<ExportMyData200> => {

  return apiFetch<ExportMyData200>(getExportMyDataUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getExportMyDataQueryKey = () => {
    return [
    `/me/export`
    ] as const;
    }


export const getExportMyDataQueryOptions = <TData = Awaited<ReturnType<typeof exportMyData>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof exportMyData>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getExportMyDataQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof exportMyData>>> = ({ signal }) => exportMyData({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof exportMyData>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ExportMyDataQueryResult = NonNullable<Awaited<ReturnType<typeof exportMyData>>>
export type ExportMyDataQueryError = ErrorType<UnauthorizedResponse>


export function useExportMyData<TData = Awaited<ReturnType<typeof exportMyData>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof exportMyData>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof exportMyData>>,
          TError,
          Awaited<ReturnType<typeof exportMyData>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useExportMyData<TData = Awaited<ReturnType<typeof exportMyData>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof exportMyData>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof exportMyData>>,
          TError,
          Awaited<ReturnType<typeof exportMyData>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useExportMyData<TData = Awaited<ReturnType<typeof exportMyData>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof exportMyData>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Экспорт своих данных (JSON)
 */

export function useExportMyData<TData = Awaited<ReturnType<typeof exportMyData>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof exportMyData>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getExportMyDataQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetMyConsentsUrl = () => {




  return `/me/consents`
}

/**
 * @summary Документы согласий и текущее состояние
 */
export const getMyConsents = async ( options?: Parameters<typeof apiFetch>[1]): Promise<ConsentState> => {

  return apiFetch<ConsentState>(getGetMyConsentsUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMyConsentsQueryKey = () => {
    return [
    `/me/consents`
    ] as const;
    }


export const getGetMyConsentsQueryOptions = <TData = Awaited<ReturnType<typeof getMyConsents>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyConsents>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMyConsentsQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMyConsents>>> = ({ signal }) => getMyConsents({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMyConsents>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMyConsentsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyConsents>>>
export type GetMyConsentsQueryError = ErrorType<UnauthorizedResponse>


export function useGetMyConsents<TData = Awaited<ReturnType<typeof getMyConsents>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyConsents>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyConsents>>,
          TError,
          Awaited<ReturnType<typeof getMyConsents>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyConsents<TData = Awaited<ReturnType<typeof getMyConsents>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyConsents>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyConsents>>,
          TError,
          Awaited<ReturnType<typeof getMyConsents>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyConsents<TData = Awaited<ReturnType<typeof getMyConsents>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyConsents>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Документы согласий и текущее состояние
 */

export function useGetMyConsents<TData = Awaited<ReturnType<typeof getMyConsents>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyConsents>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMyConsentsQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getUpdateMyConsentsUrl = () => {




  return `/me/consents`
}

/**
 * Три отдельных согласия, каждое версионируется. `given: false` отзывает согласие.
 * Отзыв `profile_visibility` скрывает профиль из выдачи. Отзыв `fsp_data` отвязывает ФСП ID.
 * `personal_data` через этот метод не отзывается (для этого `DELETE /me`), попытка даёт `422 validation_error`.
 * @summary Дать или отозвать согласия
 */
export const updateMyConsents = async (consentsUpdate: ConsentsUpdate, options?: Parameters<typeof apiFetch>[1]): Promise<ConsentState> => {

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
return apiFetch<ConsentState>(getUpdateMyConsentsUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(consentsUpdate)
  }
);}





export const getUpdateMyConsentsMutationKey = () => ['updateMyConsents'] as const;

export const getUpdateMyConsentsMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateMyConsents>>, TError,UpdateMyConsentsMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateMyConsents>>, TError,UpdateMyConsentsMutationVariables, TContext> => {

const mutationKey = getUpdateMyConsentsMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateMyConsents>>, UpdateMyConsentsMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  updateMyConsents(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateMyConsentsMutationResult = NonNullable<Awaited<ReturnType<typeof updateMyConsents>>>
    export type UpdateMyConsentsMutationBody = BodyType<ConsentsUpdate>
    export type UpdateMyConsentsMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type UpdateMyConsentsMutationVariables = {data: BodyType<ConsentsUpdate>}

    /**
 * @summary Дать или отозвать согласия
 */
export const useUpdateMyConsents = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateMyConsents>>, TError,UpdateMyConsentsMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateMyConsents>>,
        TError,
        UpdateMyConsentsMutationVariables,
        TContext
      > => {
      return useMutation(getUpdateMyConsentsMutationOptions(options), queryClient);
    }
