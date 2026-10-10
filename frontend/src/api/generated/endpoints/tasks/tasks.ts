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
  EmployerTaskSubmission,
  NotFoundResponse,
  Problem,
  RegularTask,
  RegularTaskInput,
  TaskAssignment,
  TaskScore,
  TaskSubmission,
  TaskSubmissionCreate,
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

export const getListMyTasksUrl = () => {




  return `/me/tasks`
}

/**
 * Система раздаёт задания кандидатам подходящих категорий, не чаще одного в 2 недели на человека.
 * @summary Регулярные задания, назначенные мне
 */
export const listMyTasks = async ( options?: Parameters<typeof apiFetch>[1]): Promise<TaskAssignment[]> => {

  return apiFetch<TaskAssignment[]>(getListMyTasksUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListMyTasksQueryKey = () => {
    return [
    `/me/tasks`
    ] as const;
    }


export const getListMyTasksQueryOptions = <TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListMyTasksQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listMyTasks>>> = ({ signal }) => listMyTasks({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListMyTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listMyTasks>>>
export type ListMyTasksQueryError = ErrorType<UnauthorizedResponse>


export function useListMyTasks<TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyTasks>>,
          TError,
          Awaited<ReturnType<typeof listMyTasks>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyTasks<TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyTasks>>,
          TError,
          Awaited<ReturnType<typeof listMyTasks>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyTasks<TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Регулярные задания, назначенные мне
 */

export function useListMyTasks<TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListMyTasksQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetMyTaskUrl = (taskId: string,) => {




  return `/me/tasks/${taskId}`
}

/**
 * @summary Назначенное задание
 */
export const getMyTask = async (taskId: string, options?: Parameters<typeof apiFetch>[1]): Promise<TaskAssignment> => {

  return apiFetch<TaskAssignment>(getGetMyTaskUrl(taskId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMyTaskQueryKey = (taskId: string,) => {
    return [
    `/me/tasks/${taskId}`
    ] as const;
    }


export const getGetMyTaskQueryOptions = <TData = Awaited<ReturnType<typeof getMyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTask>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMyTaskQueryKey(taskId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMyTask>>> = ({ signal }) => getMyTask(taskId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: taskId !== null && taskId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMyTask>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMyTaskQueryResult = NonNullable<Awaited<ReturnType<typeof getMyTask>>>
export type GetMyTaskQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetMyTask<TData = Awaited<ReturnType<typeof getMyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTask>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyTask>>,
          TError,
          Awaited<ReturnType<typeof getMyTask>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyTask<TData = Awaited<ReturnType<typeof getMyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTask>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyTask>>,
          TError,
          Awaited<ReturnType<typeof getMyTask>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyTask<TData = Awaited<ReturnType<typeof getMyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTask>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Назначенное задание
 */

export function useGetMyTask<TData = Awaited<ReturnType<typeof getMyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTask>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMyTaskQueryOptions(taskId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getSubmitTaskUrl = (taskId: string,) => {




  return `/tasks/${taskId}/submissions`
}

/**
 * @summary Сдать решение регулярного задания
 */
export const submitTask = async (taskId: string,
    taskSubmissionCreate: TaskSubmissionCreate, options?: Parameters<typeof apiFetch>[1]): Promise<TaskSubmission> => {

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
return apiFetch<TaskSubmission>(getSubmitTaskUrl(taskId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(taskSubmissionCreate)
  }
);}





export const getSubmitTaskMutationKey = () => ['submitTask'] as const;

export const getSubmitTaskMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof submitTask>>, TError,SubmitTaskMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof submitTask>>, TError,SubmitTaskMutationVariables, TContext> => {

const mutationKey = getSubmitTaskMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof submitTask>>, SubmitTaskMutationVariables> = (props) => {
          const {taskId,data} = props ?? {};

          return  submitTask(taskId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type SubmitTaskMutationResult = NonNullable<Awaited<ReturnType<typeof submitTask>>>
    export type SubmitTaskMutationBody = BodyType<TaskSubmissionCreate>
    export type SubmitTaskMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem | ValidationErrorResponse>
    export type SubmitTaskMutationVariables = {taskId: string;data: BodyType<TaskSubmissionCreate>}

    /**
 * @summary Сдать решение регулярного задания
 */
export const useSubmitTask = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof submitTask>>, TError,SubmitTaskMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof submitTask>>,
        TError,
        SubmitTaskMutationVariables,
        TContext
      > => {
      return useMutation(getSubmitTaskMutationOptions(options), queryClient);
    }
    export const getListCompanyTasksUrl = () => {




  return `/regular-tasks`
}

/**
 * @summary Регулярные задания компании
 */
export const listCompanyTasks = async ( options?: Parameters<typeof apiFetch>[1]): Promise<RegularTask[]> => {

  return apiFetch<RegularTask[]>(getListCompanyTasksUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListCompanyTasksQueryKey = () => {
    return [
    `/regular-tasks`
    ] as const;
    }


export const getListCompanyTasksQueryOptions = <TData = Awaited<ReturnType<typeof listCompanyTasks>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyTasks>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListCompanyTasksQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listCompanyTasks>>> = ({ signal }) => listCompanyTasks({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listCompanyTasks>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListCompanyTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listCompanyTasks>>>
export type ListCompanyTasksQueryError = ErrorType<UnauthorizedResponse>


export function useListCompanyTasks<TData = Awaited<ReturnType<typeof listCompanyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyTasks>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listCompanyTasks>>,
          TError,
          Awaited<ReturnType<typeof listCompanyTasks>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListCompanyTasks<TData = Awaited<ReturnType<typeof listCompanyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyTasks>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listCompanyTasks>>,
          TError,
          Awaited<ReturnType<typeof listCompanyTasks>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListCompanyTasks<TData = Awaited<ReturnType<typeof listCompanyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyTasks>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Регулярные задания компании
 */

export function useListCompanyTasks<TData = Awaited<ReturnType<typeof listCompanyTasks>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listCompanyTasks>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListCompanyTasksQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getCreateCompanyTaskUrl = () => {




  return `/regular-tasks`
}

/**
 * @summary Опубликовать регулярное задание
 */
export const createCompanyTask = async (regularTaskInput: RegularTaskInput, options?: Parameters<typeof apiFetch>[1]): Promise<RegularTask> => {

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
return apiFetch<RegularTask>(getCreateCompanyTaskUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(regularTaskInput)
  }
);}





export const getCreateCompanyTaskMutationKey = () => ['createCompanyTask'] as const;

export const getCreateCompanyTaskMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createCompanyTask>>, TError,CreateCompanyTaskMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createCompanyTask>>, TError,CreateCompanyTaskMutationVariables, TContext> => {

const mutationKey = getCreateCompanyTaskMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createCompanyTask>>, CreateCompanyTaskMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  createCompanyTask(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateCompanyTaskMutationResult = NonNullable<Awaited<ReturnType<typeof createCompanyTask>>>
    export type CreateCompanyTaskMutationBody = BodyType<RegularTaskInput>
    export type CreateCompanyTaskMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type CreateCompanyTaskMutationVariables = {data: BodyType<RegularTaskInput>}

    /**
 * @summary Опубликовать регулярное задание
 */
export const useCreateCompanyTask = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createCompanyTask>>, TError,CreateCompanyTaskMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createCompanyTask>>,
        TError,
        CreateCompanyTaskMutationVariables,
        TContext
      > => {
      return useMutation(getCreateCompanyTaskMutationOptions(options), queryClient);
    }
    export const getGetCompanyTaskUrl = (taskId: string,) => {




  return `/regular-tasks/${taskId}`
}

/**
 * @summary Регулярное задание компании
 */
export const getCompanyTask = async (taskId: string, options?: Parameters<typeof apiFetch>[1]): Promise<RegularTask> => {

  return apiFetch<RegularTask>(getGetCompanyTaskUrl(taskId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetCompanyTaskQueryKey = (taskId: string,) => {
    return [
    `/regular-tasks/${taskId}`
    ] as const;
    }


export const getGetCompanyTaskQueryOptions = <TData = Awaited<ReturnType<typeof getCompanyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCompanyTask>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetCompanyTaskQueryKey(taskId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getCompanyTask>>> = ({ signal }) => getCompanyTask(taskId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: taskId !== null && taskId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getCompanyTask>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetCompanyTaskQueryResult = NonNullable<Awaited<ReturnType<typeof getCompanyTask>>>
export type GetCompanyTaskQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetCompanyTask<TData = Awaited<ReturnType<typeof getCompanyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCompanyTask>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getCompanyTask>>,
          TError,
          Awaited<ReturnType<typeof getCompanyTask>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetCompanyTask<TData = Awaited<ReturnType<typeof getCompanyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCompanyTask>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getCompanyTask>>,
          TError,
          Awaited<ReturnType<typeof getCompanyTask>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetCompanyTask<TData = Awaited<ReturnType<typeof getCompanyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCompanyTask>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Регулярное задание компании
 */

export function useGetCompanyTask<TData = Awaited<ReturnType<typeof getCompanyTask>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getCompanyTask>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetCompanyTaskQueryOptions(taskId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getListTaskSubmissionsUrl = (taskId: string,) => {




  return `/regular-tasks/${taskId}/submissions`
}

/**
 * @summary Решения задания (анонимные карточки авторов, лучшие сверху)
 */
export const listTaskSubmissions = async (taskId: string, options?: Parameters<typeof apiFetch>[1]): Promise<EmployerTaskSubmission[]> => {

  return apiFetch<EmployerTaskSubmission[]>(getListTaskSubmissionsUrl(taskId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListTaskSubmissionsQueryKey = (taskId: string,) => {
    return [
    `/regular-tasks/${taskId}/submissions`
    ] as const;
    }


export const getListTaskSubmissionsQueryOptions = <TData = Awaited<ReturnType<typeof listTaskSubmissions>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listTaskSubmissions>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListTaskSubmissionsQueryKey(taskId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listTaskSubmissions>>> = ({ signal }) => listTaskSubmissions(taskId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: taskId !== null && taskId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listTaskSubmissions>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListTaskSubmissionsQueryResult = NonNullable<Awaited<ReturnType<typeof listTaskSubmissions>>>
export type ListTaskSubmissionsQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useListTaskSubmissions<TData = Awaited<ReturnType<typeof listTaskSubmissions>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listTaskSubmissions>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listTaskSubmissions>>,
          TError,
          Awaited<ReturnType<typeof listTaskSubmissions>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListTaskSubmissions<TData = Awaited<ReturnType<typeof listTaskSubmissions>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listTaskSubmissions>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listTaskSubmissions>>,
          TError,
          Awaited<ReturnType<typeof listTaskSubmissions>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListTaskSubmissions<TData = Awaited<ReturnType<typeof listTaskSubmissions>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listTaskSubmissions>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Решения задания (анонимные карточки авторов, лучшие сверху)
 */

export function useListTaskSubmissions<TData = Awaited<ReturnType<typeof listTaskSubmissions>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 taskId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listTaskSubmissions>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListTaskSubmissionsQueryOptions(taskId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getScoreTaskSubmissionUrl = (taskId: string,
    submissionId: string,) => {




  return `/regular-tasks/${taskId}/submissions/${submissionId}/score`
}

/**
 * @summary Итоговая оценка решения по рубрике (последнее слово за человеком)
 */
export const scoreTaskSubmission = async (taskId: string,
    submissionId: string,
    taskScore: TaskScore, options?: Parameters<typeof apiFetch>[1]): Promise<EmployerTaskSubmission> => {

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
return apiFetch<EmployerTaskSubmission>(getScoreTaskSubmissionUrl(taskId,submissionId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(taskScore)
  }
);}





export const getScoreTaskSubmissionMutationKey = () => ['scoreTaskSubmission'] as const;

export const getScoreTaskSubmissionMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof scoreTaskSubmission>>, TError,ScoreTaskSubmissionMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof scoreTaskSubmission>>, TError,ScoreTaskSubmissionMutationVariables, TContext> => {

const mutationKey = getScoreTaskSubmissionMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof scoreTaskSubmission>>, ScoreTaskSubmissionMutationVariables> = (props) => {
          const {taskId,submissionId,data} = props ?? {};

          return  scoreTaskSubmission(taskId,submissionId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type ScoreTaskSubmissionMutationResult = NonNullable<Awaited<ReturnType<typeof scoreTaskSubmission>>>
    export type ScoreTaskSubmissionMutationBody = BodyType<TaskScore>
    export type ScoreTaskSubmissionMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>
    export type ScoreTaskSubmissionMutationVariables = {taskId: string;submissionId: string;data: BodyType<TaskScore>}

    /**
 * @summary Итоговая оценка решения по рубрике (последнее слово за человеком)
 */
export const useScoreTaskSubmission = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof scoreTaskSubmission>>, TError,ScoreTaskSubmissionMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof scoreTaskSubmission>>,
        TError,
        ScoreTaskSubmissionMutationVariables,
        TContext
      > => {
      return useMutation(getScoreTaskSubmissionMutationOptions(options), queryClient);
    }
