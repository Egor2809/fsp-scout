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
  Application,
  ApplicationCreate,
  ApplicationStatusUpdate,
  ConflictResponse,
  EmployerApplication,
  ListVacanciesParams,
  NotFoundResponse,
  Problem,
  TestBlueprint,
  UnauthorizedResponse,
  Vacancy,
  VacancyInput,
  VacancyPage,
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

export const getListVacanciesUrl = (params?: ListVacanciesParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/vacancies?${stringifiedParams}` : `/vacancies`
}

/**
 * Для кандидата в каждой вакансии есть `match` (соответствие его профилю) и `my_application`.
 * @summary Каталог опубликованных вакансий
 */
export const listVacancies = async (params?: ListVacanciesParams, options?: Parameters<typeof apiFetch>[1]): Promise<VacancyPage> => {

  return apiFetch<VacancyPage>(getListVacanciesUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListVacanciesQueryKey = (params?: ListVacanciesParams,) => {
    return [
    `/vacancies`, ...(params ? [params] : [])
    ] as const;
    }


export const getListVacanciesQueryOptions = <TData = Awaited<ReturnType<typeof listVacancies>>, TError = ErrorType<UnauthorizedResponse>>(params?: ListVacanciesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListVacanciesQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listVacancies>>> = ({ signal }) => listVacancies(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listVacancies>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListVacanciesQueryResult = NonNullable<Awaited<ReturnType<typeof listVacancies>>>
export type ListVacanciesQueryError = ErrorType<UnauthorizedResponse>


export function useListVacancies<TData = Awaited<ReturnType<typeof listVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
 params: undefined |  ListVacanciesParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancies>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listVacancies>>,
          TError,
          Awaited<ReturnType<typeof listVacancies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListVacancies<TData = Awaited<ReturnType<typeof listVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListVacanciesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancies>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listVacancies>>,
          TError,
          Awaited<ReturnType<typeof listVacancies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListVacancies<TData = Awaited<ReturnType<typeof listVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListVacanciesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Каталог опубликованных вакансий
 */

export function useListVacancies<TData = Awaited<ReturnType<typeof listVacancies>>, TError = ErrorType<UnauthorizedResponse>>(
 params?: ListVacanciesParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListVacanciesQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getCreateVacancyUrl = () => {




  return `/vacancies`
}

/**
 * @summary Создать вакансию
 */
export const createVacancy = async (vacancyInput: VacancyInput, options?: Parameters<typeof apiFetch>[1]): Promise<Vacancy> => {

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
return apiFetch<Vacancy>(getCreateVacancyUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(vacancyInput)
  }
);}





export const getCreateVacancyMutationKey = () => ['createVacancy'] as const;

export const getCreateVacancyMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createVacancy>>, TError,CreateVacancyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createVacancy>>, TError,CreateVacancyMutationVariables, TContext> => {

const mutationKey = getCreateVacancyMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createVacancy>>, CreateVacancyMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  createVacancy(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateVacancyMutationResult = NonNullable<Awaited<ReturnType<typeof createVacancy>>>
    export type CreateVacancyMutationBody = BodyType<VacancyInput>
    export type CreateVacancyMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type CreateVacancyMutationVariables = {data: BodyType<VacancyInput>}

    /**
 * @summary Создать вакансию
 */
export const useCreateVacancy = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createVacancy>>, TError,CreateVacancyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createVacancy>>,
        TError,
        CreateVacancyMutationVariables,
        TContext
      > => {
      return useMutation(getCreateVacancyMutationOptions(options), queryClient);
    }
    export const getGetVacancyUrl = (vacancyId: string,) => {




  return `/vacancies/${vacancyId}`
}

/**
 * @summary Вакансия
 */
export const getVacancy = async (vacancyId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Vacancy> => {

  return apiFetch<Vacancy>(getGetVacancyUrl(vacancyId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetVacancyQueryKey = (vacancyId: string,) => {
    return [
    `/vacancies/${vacancyId}`
    ] as const;
    }


export const getGetVacancyQueryOptions = <TData = Awaited<ReturnType<typeof getVacancy>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancy>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetVacancyQueryKey(vacancyId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getVacancy>>> = ({ signal }) => getVacancy(vacancyId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: vacancyId !== null && vacancyId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getVacancy>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetVacancyQueryResult = NonNullable<Awaited<ReturnType<typeof getVacancy>>>
export type GetVacancyQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetVacancy<TData = Awaited<ReturnType<typeof getVacancy>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancy>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getVacancy>>,
          TError,
          Awaited<ReturnType<typeof getVacancy>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetVacancy<TData = Awaited<ReturnType<typeof getVacancy>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancy>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getVacancy>>,
          TError,
          Awaited<ReturnType<typeof getVacancy>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetVacancy<TData = Awaited<ReturnType<typeof getVacancy>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancy>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Вакансия
 */

export function useGetVacancy<TData = Awaited<ReturnType<typeof getVacancy>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancy>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetVacancyQueryOptions(vacancyId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getUpdateVacancyUrl = (vacancyId: string,) => {




  return `/vacancies/${vacancyId}`
}

/**
 * @summary Изменить вакансию своей компании
 */
export const updateVacancy = async (vacancyId: string,
    vacancyInput: VacancyInput, options?: Parameters<typeof apiFetch>[1]): Promise<Vacancy> => {

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
return apiFetch<Vacancy>(getUpdateVacancyUrl(vacancyId),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(vacancyInput)
  }
);}





export const getUpdateVacancyMutationKey = () => ['updateVacancy'] as const;

export const getUpdateVacancyMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateVacancy>>, TError,UpdateVacancyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateVacancy>>, TError,UpdateVacancyMutationVariables, TContext> => {

const mutationKey = getUpdateVacancyMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateVacancy>>, UpdateVacancyMutationVariables> = (props) => {
          const {vacancyId,data} = props ?? {};

          return  updateVacancy(vacancyId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateVacancyMutationResult = NonNullable<Awaited<ReturnType<typeof updateVacancy>>>
    export type UpdateVacancyMutationBody = BodyType<VacancyInput>
    export type UpdateVacancyMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>
    export type UpdateVacancyMutationVariables = {vacancyId: string;data: BodyType<VacancyInput>}

    /**
 * @summary Изменить вакансию своей компании
 */
export const useUpdateVacancy = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateVacancy>>, TError,UpdateVacancyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateVacancy>>,
        TError,
        UpdateVacancyMutationVariables,
        TContext
      > => {
      return useMutation(getUpdateVacancyMutationOptions(options), queryClient);
    }
    export const getApplyToVacancyUrl = (vacancyId: string,) => {




  return `/vacancies/${vacancyId}/apply`
}

/**
 * @summary Откликнуться (раскрывает контакты этой компании)
 */
export const applyToVacancy = async (vacancyId: string,
    applicationCreate?: ApplicationCreate, options?: Parameters<typeof apiFetch>[1]): Promise<Application> => {

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
return apiFetch<Application>(getApplyToVacancyUrl(vacancyId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(applicationCreate)
  }
);}





export const getApplyToVacancyMutationKey = () => ['applyToVacancy'] as const;

export const getApplyToVacancyMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof applyToVacancy>>, TError,ApplyToVacancyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof applyToVacancy>>, TError,ApplyToVacancyMutationVariables, TContext> => {

const mutationKey = getApplyToVacancyMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof applyToVacancy>>, ApplyToVacancyMutationVariables> = (props) => {
          const {vacancyId,data} = props ?? {};

          return  applyToVacancy(vacancyId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type ApplyToVacancyMutationResult = NonNullable<Awaited<ReturnType<typeof applyToVacancy>>>
    export type ApplyToVacancyMutationBody = BodyType<ApplicationCreate> | undefined
    export type ApplyToVacancyMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>
    export type ApplyToVacancyMutationVariables = {vacancyId: string;data?: BodyType<ApplicationCreate>}

    /**
 * @summary Откликнуться (раскрывает контакты этой компании)
 */
export const useApplyToVacancy = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof applyToVacancy>>, TError,ApplyToVacancyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof applyToVacancy>>,
        TError,
        ApplyToVacancyMutationVariables,
        TContext
      > => {
      return useMutation(getApplyToVacancyMutationOptions(options), queryClient);
    }
    export const getListVacancyApplicationsUrl = (vacancyId: string,) => {




  return `/vacancies/${vacancyId}/applications`
}

/**
 * @summary Отклики на вакансию, отсортированные скорингом
 */
export const listVacancyApplications = async (vacancyId: string, options?: Parameters<typeof apiFetch>[1]): Promise<EmployerApplication[]> => {

  return apiFetch<EmployerApplication[]>(getListVacancyApplicationsUrl(vacancyId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListVacancyApplicationsQueryKey = (vacancyId: string,) => {
    return [
    `/vacancies/${vacancyId}/applications`
    ] as const;
    }


export const getListVacancyApplicationsQueryOptions = <TData = Awaited<ReturnType<typeof listVacancyApplications>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancyApplications>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListVacancyApplicationsQueryKey(vacancyId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listVacancyApplications>>> = ({ signal }) => listVacancyApplications(vacancyId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: vacancyId !== null && vacancyId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listVacancyApplications>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListVacancyApplicationsQueryResult = NonNullable<Awaited<ReturnType<typeof listVacancyApplications>>>
export type ListVacancyApplicationsQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useListVacancyApplications<TData = Awaited<ReturnType<typeof listVacancyApplications>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancyApplications>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listVacancyApplications>>,
          TError,
          Awaited<ReturnType<typeof listVacancyApplications>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListVacancyApplications<TData = Awaited<ReturnType<typeof listVacancyApplications>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancyApplications>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listVacancyApplications>>,
          TError,
          Awaited<ReturnType<typeof listVacancyApplications>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListVacancyApplications<TData = Awaited<ReturnType<typeof listVacancyApplications>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancyApplications>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Отклики на вакансию, отсортированные скорингом
 */

export function useListVacancyApplications<TData = Awaited<ReturnType<typeof listVacancyApplications>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listVacancyApplications>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListVacancyApplicationsQueryOptions(vacancyId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetVacancyTestBlueprintUrl = (vacancyId: string,) => {




  return `/vacancies/${vacancyId}/test-blueprint`
}

/**
 * Бланк строится из навыков и весов вакансии при её сохранении; этот метод отдаёт текущий.
 * @summary «Вакансия → бланк теста» (доли компетенций)
 */
export const getVacancyTestBlueprint = async (vacancyId: string, options?: Parameters<typeof apiFetch>[1]): Promise<TestBlueprint> => {

  return apiFetch<TestBlueprint>(getGetVacancyTestBlueprintUrl(vacancyId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetVacancyTestBlueprintQueryKey = (vacancyId: string,) => {
    return [
    `/vacancies/${vacancyId}/test-blueprint`
    ] as const;
    }


export const getGetVacancyTestBlueprintQueryOptions = <TData = Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetVacancyTestBlueprintQueryKey(vacancyId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getVacancyTestBlueprint>>> = ({ signal }) => getVacancyTestBlueprint(vacancyId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: vacancyId !== null && vacancyId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetVacancyTestBlueprintQueryResult = NonNullable<Awaited<ReturnType<typeof getVacancyTestBlueprint>>>
export type GetVacancyTestBlueprintQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetVacancyTestBlueprint<TData = Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getVacancyTestBlueprint>>,
          TError,
          Awaited<ReturnType<typeof getVacancyTestBlueprint>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetVacancyTestBlueprint<TData = Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getVacancyTestBlueprint>>,
          TError,
          Awaited<ReturnType<typeof getVacancyTestBlueprint>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetVacancyTestBlueprint<TData = Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary «Вакансия → бланк теста» (доли компетенций)
 */

export function useGetVacancyTestBlueprint<TData = Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 vacancyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getVacancyTestBlueprint>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetVacancyTestBlueprintQueryOptions(vacancyId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getListMyApplicationsUrl = () => {




  return `/me/applications`
}

/**
 * @summary Мои отклики
 */
export const listMyApplications = async ( options?: Parameters<typeof apiFetch>[1]): Promise<Application[]> => {

  return apiFetch<Application[]>(getListMyApplicationsUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListMyApplicationsQueryKey = () => {
    return [
    `/me/applications`
    ] as const;
    }


export const getListMyApplicationsQueryOptions = <TData = Awaited<ReturnType<typeof listMyApplications>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyApplications>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListMyApplicationsQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listMyApplications>>> = ({ signal }) => listMyApplications({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listMyApplications>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListMyApplicationsQueryResult = NonNullable<Awaited<ReturnType<typeof listMyApplications>>>
export type ListMyApplicationsQueryError = ErrorType<UnauthorizedResponse>


export function useListMyApplications<TData = Awaited<ReturnType<typeof listMyApplications>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyApplications>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyApplications>>,
          TError,
          Awaited<ReturnType<typeof listMyApplications>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyApplications<TData = Awaited<ReturnType<typeof listMyApplications>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyApplications>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyApplications>>,
          TError,
          Awaited<ReturnType<typeof listMyApplications>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyApplications<TData = Awaited<ReturnType<typeof listMyApplications>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyApplications>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Мои отклики
 */

export function useListMyApplications<TData = Awaited<ReturnType<typeof listMyApplications>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyApplications>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListMyApplicationsQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getWithdrawApplicationUrl = (applicationId: string,) => {




  return `/applications/${applicationId}/withdraw`
}

/**
 * @summary Отозвать свой отклик
 */
export const withdrawApplication = async (applicationId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Application> => {

  return apiFetch<Application>(getWithdrawApplicationUrl(applicationId),
  {
    ...options,
    method: 'POST'


  }
);}





export const getWithdrawApplicationMutationKey = () => ['withdrawApplication'] as const;

export const getWithdrawApplicationMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof withdrawApplication>>, TError,WithdrawApplicationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof withdrawApplication>>, TError,WithdrawApplicationMutationVariables, TContext> => {

const mutationKey = getWithdrawApplicationMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof withdrawApplication>>, WithdrawApplicationMutationVariables> = (props) => {
          const {applicationId} = props ?? {};

          return  withdrawApplication(applicationId,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type WithdrawApplicationMutationResult = NonNullable<Awaited<ReturnType<typeof withdrawApplication>>>

    export type WithdrawApplicationMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>
    export type WithdrawApplicationMutationVariables = {applicationId: string}

    /**
 * @summary Отозвать свой отклик
 */
export const useWithdrawApplication = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof withdrawApplication>>, TError,WithdrawApplicationMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof withdrawApplication>>,
        TError,
        WithdrawApplicationMutationVariables,
        TContext
      > => {
      return useMutation(getWithdrawApplicationMutationOptions(options), queryClient);
    }
    export const getUpdateApplicationStatusUrl = (applicationId: string,) => {




  return `/applications/${applicationId}/status`
}

/**
 * @summary Сменить статус отклика (работодатель)
 */
export const updateApplicationStatus = async (applicationId: string,
    applicationStatusUpdate: ApplicationStatusUpdate, options?: Parameters<typeof apiFetch>[1]): Promise<EmployerApplication> => {

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
return apiFetch<EmployerApplication>(getUpdateApplicationStatusUrl(applicationId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(applicationStatusUpdate)
  }
);}





export const getUpdateApplicationStatusMutationKey = () => ['updateApplicationStatus'] as const;

export const getUpdateApplicationStatusMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateApplicationStatus>>, TError,UpdateApplicationStatusMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateApplicationStatus>>, TError,UpdateApplicationStatusMutationVariables, TContext> => {

const mutationKey = getUpdateApplicationStatusMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateApplicationStatus>>, UpdateApplicationStatusMutationVariables> = (props) => {
          const {applicationId,data} = props ?? {};

          return  updateApplicationStatus(applicationId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateApplicationStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateApplicationStatus>>>
    export type UpdateApplicationStatusMutationBody = BodyType<ApplicationStatusUpdate>
    export type UpdateApplicationStatusMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>
    export type UpdateApplicationStatusMutationVariables = {applicationId: string;data: BodyType<ApplicationStatusUpdate>}

    /**
 * @summary Сменить статус отклика (работодатель)
 */
export const useUpdateApplicationStatus = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateApplicationStatus>>, TError,UpdateApplicationStatusMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateApplicationStatus>>,
        TError,
        UpdateApplicationStatusMutationVariables,
        TContext
      > => {
      return useMutation(getUpdateApplicationStatusMutationOptions(options), queryClient);
    }
