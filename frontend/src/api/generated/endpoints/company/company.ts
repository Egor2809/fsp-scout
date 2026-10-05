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
  Company,
  CompanyUpdate,
  ForbiddenResponse,
  InvitationQuota,
  UnauthorizedResponse,
  Vacancy,
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

export const getGetMyCompanyUrl = () => {




  return `/company`
}

/**
 * @summary Профиль своей компании
 */
export const getMyCompany = async ( options?: Parameters<typeof apiFetch>[1]): Promise<Company> => {

  return apiFetch<Company>(getGetMyCompanyUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMyCompanyQueryKey = () => {
    return [
    `/company`
    ] as const;
    }


export const getGetMyCompanyQueryOptions = <TData = Awaited<ReturnType<typeof getMyCompany>>, TError = ErrorType<UnauthorizedResponse | ForbiddenResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyCompany>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMyCompanyQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMyCompany>>> = ({ signal }) => getMyCompany({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMyCompany>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMyCompanyQueryResult = NonNullable<Awaited<ReturnType<typeof getMyCompany>>>
export type GetMyCompanyQueryError = ErrorType<UnauthorizedResponse | ForbiddenResponse>


export function useGetMyCompany<TData = Awaited<ReturnType<typeof getMyCompany>>, TError = ErrorType<UnauthorizedResponse | ForbiddenResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyCompany>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyCompany>>,
          TError,
          Awaited<ReturnType<typeof getMyCompany>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyCompany<TData = Awaited<ReturnType<typeof getMyCompany>>, TError = ErrorType<UnauthorizedResponse | ForbiddenResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyCompany>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyCompany>>,
          TError,
          Awaited<ReturnType<typeof getMyCompany>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyCompany<TData = Awaited<ReturnType<typeof getMyCompany>>, TError = ErrorType<UnauthorizedResponse | ForbiddenResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyCompany>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Профиль своей компании
 */

export function useGetMyCompany<TData = Awaited<ReturnType<typeof getMyCompany>>, TError = ErrorType<UnauthorizedResponse | ForbiddenResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyCompany>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMyCompanyQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getUpdateMyCompanyUrl = () => {




  return `/company`
}

/**
 * @summary Изменить профиль компании
 */
export const updateMyCompany = async (companyUpdate: CompanyUpdate, options?: Parameters<typeof apiFetch>[1]): Promise<Company> => {

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
return apiFetch<Company>(getUpdateMyCompanyUrl(),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(companyUpdate)
  }
);}





export const getUpdateMyCompanyMutationKey = () => ['updateMyCompany'] as const;

export const getUpdateMyCompanyMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateMyCompany>>, TError,UpdateMyCompanyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateMyCompany>>, TError,UpdateMyCompanyMutationVariables, TContext> => {

const mutationKey = getUpdateMyCompanyMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateMyCompany>>, UpdateMyCompanyMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  updateMyCompany(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateMyCompanyMutationResult = NonNullable<Awaited<ReturnType<typeof updateMyCompany>>>
    export type UpdateMyCompanyMutationBody = BodyType<CompanyUpdate>
    export type UpdateMyCompanyMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type UpdateMyCompanyMutationVariables = {data: BodyType<CompanyUpdate>}

    /**
 * @summary Изменить профиль компании
 */
export const useUpdateMyCompany = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateMyCompany>>, TError,UpdateMyCompanyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateMyCompany>>,
        TError,
        UpdateMyCompanyMutationVariables,
        TContext
      > => {
      return useMutation(getUpdateMyCompanyMutationOptions(options), queryClient);
    }
    export const getGetInvitationQuotaUrl = () => {




  return `/company/invitation-quota`
}

/**
 * @summary Квота инвайтов на текущую неделю
 */
export const getInvitationQuota = async ( options?: Parameters<typeof apiFetch>[1]): Promise<InvitationQuota> => {

  return apiFetch<InvitationQuota>(getGetInvitationQuotaUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetInvitationQuotaQueryKey = () => {
    return [
    `/company/invitation-quota`
    ] as const;
    }


export const getGetInvitationQuotaQueryOptions = <TData = Awaited<ReturnType<typeof getInvitationQuota>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationQuota>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetInvitationQuotaQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getInvitationQuota>>> = ({ signal }) => getInvitationQuota({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getInvitationQuota>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetInvitationQuotaQueryResult = NonNullable<Awaited<ReturnType<typeof getInvitationQuota>>>
export type GetInvitationQuotaQueryError = ErrorType<UnauthorizedResponse>


export function useGetInvitationQuota<TData = Awaited<ReturnType<typeof getInvitationQuota>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationQuota>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getInvitationQuota>>,
          TError,
          Awaited<ReturnType<typeof getInvitationQuota>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetInvitationQuota<TData = Awaited<ReturnType<typeof getInvitationQuota>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationQuota>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getInvitationQuota>>,
          TError,
          Awaited<ReturnType<typeof getInvitationQuota>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetInvitationQuota<TData = Awaited<ReturnType<typeof getInvitationQuota>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationQuota>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Квота инвайтов на текущую неделю
 */

export function useGetInvitationQuota<TData = Awaited<ReturnType<typeof getInvitationQuota>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getInvitationQuota>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetInvitationQuotaQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getListMyCompanyVacanciesUrl = () => {




  return `/company/vacancies`
}

/**
 * @summary Вакансии своей компании (все статусы)
 */
export const listMyCompanyVacancies = async ( options?: Parameters<typeof apiFetch>[1]): Promise<Vacancy[]> => {

  return apiFetch<Vacancy[]>(getListMyCompanyVacanciesUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListMyCompanyVacanciesQueryKey = () => {
    return [
    `/company/vacancies`
    ] as const;
    }


export const getListMyCompanyVacanciesQueryOptions = <TData = Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListMyCompanyVacanciesQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listMyCompanyVacancies>>> = ({ signal }) => listMyCompanyVacancies({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListMyCompanyVacanciesQueryResult = NonNullable<Awaited<ReturnType<typeof listMyCompanyVacancies>>>
export type ListMyCompanyVacanciesQueryError = ErrorType<UnauthorizedResponse>


export function useListMyCompanyVacancies<TData = Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyCompanyVacancies>>,
          TError,
          Awaited<ReturnType<typeof listMyCompanyVacancies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyCompanyVacancies<TData = Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyCompanyVacancies>>,
          TError,
          Awaited<ReturnType<typeof listMyCompanyVacancies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyCompanyVacancies<TData = Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Вакансии своей компании (все статусы)
 */

export function useListMyCompanyVacancies<TData = Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyCompanyVacancies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListMyCompanyVacanciesQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






