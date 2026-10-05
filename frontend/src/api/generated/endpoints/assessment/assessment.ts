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
  AnswerAck,
  AnswerSubmit,
  CodeRunRequest,
  CodeRunResult,
  ConflictResponse,
  ConsentRequiredResponse,
  GetMyTestEligibilityParams,
  GradeHistoryEntry,
  ItemFamily,
  ItemFamilyBrief,
  NotFoundResponse,
  Problem,
  Survey,
  SurveyCreate,
  TestCreate,
  TestEligibility,
  TestResult,
  TestSession,
  TestSessionSummary,
  TestStep,
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

export const getCreateSurveyUrl = () => {




  return `/surveys`
}

/**
 * Данные опроса обновляют профиль (специализация, стек как `self`, формат, город, ожидания).
 * @summary Пройти опрос (отрасль, специализация, стек, стаж, формат, ожидания)
 */
export const createSurvey = async (surveyCreate: SurveyCreate, options?: Parameters<typeof apiFetch>[1]): Promise<Survey> => {

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
return apiFetch<Survey>(getCreateSurveyUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(surveyCreate)
  }
);}





export const getCreateSurveyMutationKey = () => ['createSurvey'] as const;

export const getCreateSurveyMutationOptions = <TError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createSurvey>>, TError,CreateSurveyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createSurvey>>, TError,CreateSurveyMutationVariables, TContext> => {

const mutationKey = getCreateSurveyMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createSurvey>>, CreateSurveyMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  createSurvey(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateSurveyMutationResult = NonNullable<Awaited<ReturnType<typeof createSurvey>>>
    export type CreateSurveyMutationBody = BodyType<SurveyCreate>
    export type CreateSurveyMutationError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | ValidationErrorResponse>
    export type CreateSurveyMutationVariables = {data: BodyType<SurveyCreate>}

    /**
 * @summary Пройти опрос (отрасль, специализация, стек, стаж, формат, ожидания)
 */
export const useCreateSurvey = <TError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createSurvey>>, TError,CreateSurveyMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createSurvey>>,
        TError,
        CreateSurveyMutationVariables,
        TContext
      > => {
      return useMutation(getCreateSurveyMutationOptions(options), queryClient);
    }
    export const getListMySurveysUrl = () => {




  return `/me/surveys`
}

/**
 * @summary История опросов (новые сверху)
 */
export const listMySurveys = async ( options?: Parameters<typeof apiFetch>[1]): Promise<Survey[]> => {

  return apiFetch<Survey[]>(getListMySurveysUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListMySurveysQueryKey = () => {
    return [
    `/me/surveys`
    ] as const;
    }


export const getListMySurveysQueryOptions = <TData = Awaited<ReturnType<typeof listMySurveys>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMySurveys>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListMySurveysQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listMySurveys>>> = ({ signal }) => listMySurveys({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listMySurveys>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListMySurveysQueryResult = NonNullable<Awaited<ReturnType<typeof listMySurveys>>>
export type ListMySurveysQueryError = ErrorType<UnauthorizedResponse>


export function useListMySurveys<TData = Awaited<ReturnType<typeof listMySurveys>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMySurveys>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMySurveys>>,
          TError,
          Awaited<ReturnType<typeof listMySurveys>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMySurveys<TData = Awaited<ReturnType<typeof listMySurveys>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMySurveys>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMySurveys>>,
          TError,
          Awaited<ReturnType<typeof listMySurveys>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMySurveys<TData = Awaited<ReturnType<typeof listMySurveys>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMySurveys>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary История опросов (новые сверху)
 */

export function useListMySurveys<TData = Awaited<ReturnType<typeof listMySurveys>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMySurveys>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListMySurveysQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetMyTestEligibilityUrl = (params?: GetMyTestEligibilityParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/me/test-eligibility?${stringifiedParams}` : `/me/test-eligibility`
}

/**
 * @summary Какие грейды можно выбрать сейчас и когда следующая попытка
 */
export const getMyTestEligibility = async (params?: GetMyTestEligibilityParams, options?: Parameters<typeof apiFetch>[1]): Promise<TestEligibility> => {

  return apiFetch<TestEligibility>(getGetMyTestEligibilityUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMyTestEligibilityQueryKey = (params?: GetMyTestEligibilityParams,) => {
    return [
    `/me/test-eligibility`, ...(params ? [params] : [])
    ] as const;
    }


export const getGetMyTestEligibilityQueryOptions = <TData = Awaited<ReturnType<typeof getMyTestEligibility>>, TError = ErrorType<UnauthorizedResponse | ConflictResponse>>(params?: GetMyTestEligibilityParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTestEligibility>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMyTestEligibilityQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMyTestEligibility>>> = ({ signal }) => getMyTestEligibility(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMyTestEligibility>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMyTestEligibilityQueryResult = NonNullable<Awaited<ReturnType<typeof getMyTestEligibility>>>
export type GetMyTestEligibilityQueryError = ErrorType<UnauthorizedResponse | ConflictResponse>


export function useGetMyTestEligibility<TData = Awaited<ReturnType<typeof getMyTestEligibility>>, TError = ErrorType<UnauthorizedResponse | ConflictResponse>>(
 params: undefined |  GetMyTestEligibilityParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTestEligibility>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyTestEligibility>>,
          TError,
          Awaited<ReturnType<typeof getMyTestEligibility>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyTestEligibility<TData = Awaited<ReturnType<typeof getMyTestEligibility>>, TError = ErrorType<UnauthorizedResponse | ConflictResponse>>(
 params?: GetMyTestEligibilityParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTestEligibility>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyTestEligibility>>,
          TError,
          Awaited<ReturnType<typeof getMyTestEligibility>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyTestEligibility<TData = Awaited<ReturnType<typeof getMyTestEligibility>>, TError = ErrorType<UnauthorizedResponse | ConflictResponse>>(
 params?: GetMyTestEligibilityParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTestEligibility>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Какие грейды можно выбрать сейчас и когда следующая попытка
 */

export function useGetMyTestEligibility<TData = Awaited<ReturnType<typeof getMyTestEligibility>>, TError = ErrorType<UnauthorizedResponse | ConflictResponse>>(
 params?: GetMyTestEligibilityParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyTestEligibility>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMyTestEligibilityQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getStartTestUrl = () => {




  return `/tests`
}

/**
 * @summary Начать тест на заявленный грейд
 */
export const startTest = async (testCreate: TestCreate, options?: Parameters<typeof apiFetch>[1]): Promise<TestSession> => {

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
return apiFetch<TestSession>(getStartTestUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(testCreate)
  }
);}





export const getStartTestMutationKey = () => ['startTest'] as const;

export const getStartTestMutationOptions = <TError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | Problem | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof startTest>>, TError,StartTestMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof startTest>>, TError,StartTestMutationVariables, TContext> => {

const mutationKey = getStartTestMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof startTest>>, StartTestMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  startTest(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type StartTestMutationResult = NonNullable<Awaited<ReturnType<typeof startTest>>>
    export type StartTestMutationBody = BodyType<TestCreate>
    export type StartTestMutationError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | Problem | ValidationErrorResponse>
    export type StartTestMutationVariables = {data: BodyType<TestCreate>}

    /**
 * @summary Начать тест на заявленный грейд
 */
export const useStartTest = <TError = ErrorType<UnauthorizedResponse | ConsentRequiredResponse | Problem | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof startTest>>, TError,StartTestMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof startTest>>,
        TError,
        StartTestMutationVariables,
        TContext
      > => {
      return useMutation(getStartTestMutationOptions(options), queryClient);
    }
    export const getListMyTestsUrl = () => {




  return `/me/tests`
}

/**
 * @summary История тестов (новые сверху)
 */
export const listMyTests = async ( options?: Parameters<typeof apiFetch>[1]): Promise<TestSessionSummary[]> => {

  return apiFetch<TestSessionSummary[]>(getListMyTestsUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListMyTestsQueryKey = () => {
    return [
    `/me/tests`
    ] as const;
    }


export const getListMyTestsQueryOptions = <TData = Awaited<ReturnType<typeof listMyTests>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTests>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListMyTestsQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listMyTests>>> = ({ signal }) => listMyTests({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listMyTests>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListMyTestsQueryResult = NonNullable<Awaited<ReturnType<typeof listMyTests>>>
export type ListMyTestsQueryError = ErrorType<UnauthorizedResponse>


export function useListMyTests<TData = Awaited<ReturnType<typeof listMyTests>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTests>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyTests>>,
          TError,
          Awaited<ReturnType<typeof listMyTests>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyTests<TData = Awaited<ReturnType<typeof listMyTests>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTests>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listMyTests>>,
          TError,
          Awaited<ReturnType<typeof listMyTests>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListMyTests<TData = Awaited<ReturnType<typeof listMyTests>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTests>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary История тестов (новые сверху)
 */

export function useListMyTests<TData = Awaited<ReturnType<typeof listMyTests>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listMyTests>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListMyTestsQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetTestUrl = (testId: string,) => {




  return `/tests/${testId}`
}

/**
 * @summary Состояние сессии теста
 */
export const getTest = async (testId: string, options?: Parameters<typeof apiFetch>[1]): Promise<TestSession> => {

  return apiFetch<TestSession>(getGetTestUrl(testId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetTestQueryKey = (testId: string,) => {
    return [
    `/tests/${testId}`
    ] as const;
    }


export const getGetTestQueryOptions = <TData = Awaited<ReturnType<typeof getTest>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTest>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetTestQueryKey(testId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getTest>>> = ({ signal }) => getTest(testId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: testId !== null && testId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getTest>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetTestQueryResult = NonNullable<Awaited<ReturnType<typeof getTest>>>
export type GetTestQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetTest<TData = Awaited<ReturnType<typeof getTest>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 testId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTest>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getTest>>,
          TError,
          Awaited<ReturnType<typeof getTest>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetTest<TData = Awaited<ReturnType<typeof getTest>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTest>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getTest>>,
          TError,
          Awaited<ReturnType<typeof getTest>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetTest<TData = Awaited<ReturnType<typeof getTest>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTest>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Состояние сессии теста
 */

export function useGetTest<TData = Awaited<ReturnType<typeof getTest>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTest>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetTestQueryOptions(testId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetNextTestItemUrl = (testId: string,) => {




  return `/tests/${testId}/next`
}

/**
 * Идемпотентно: пока на текущее задание нет ответа, возвращается оно же.
 * Когда критерий остановки достигнут (SE(θ) < 0.35 после минимума заданий, или максимум,
 * и практический блок сдан), возвращается `status: ready_to_finish` и `item: null`.
 * @summary Следующее задание (CAT)
 */
export const getNextTestItem = async (testId: string, options?: Parameters<typeof apiFetch>[1]): Promise<TestStep> => {

  return apiFetch<TestStep>(getGetNextTestItemUrl(testId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetNextTestItemQueryKey = (testId: string,) => {
    return [
    `/tests/${testId}/next`
    ] as const;
    }


export const getGetNextTestItemQueryOptions = <TData = Awaited<ReturnType<typeof getNextTestItem>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNextTestItem>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetNextTestItemQueryKey(testId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getNextTestItem>>> = ({ signal }) => getNextTestItem(testId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: testId !== null && testId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getNextTestItem>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetNextTestItemQueryResult = NonNullable<Awaited<ReturnType<typeof getNextTestItem>>>
export type GetNextTestItemQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>


export function useGetNextTestItem<TData = Awaited<ReturnType<typeof getNextTestItem>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNextTestItem>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getNextTestItem>>,
          TError,
          Awaited<ReturnType<typeof getNextTestItem>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetNextTestItem<TData = Awaited<ReturnType<typeof getNextTestItem>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNextTestItem>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getNextTestItem>>,
          TError,
          Awaited<ReturnType<typeof getNextTestItem>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetNextTestItem<TData = Awaited<ReturnType<typeof getNextTestItem>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNextTestItem>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Следующее задание (CAT)
 */

export function useGetNextTestItem<TData = Awaited<ReturnType<typeof getNextTestItem>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getNextTestItem>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetNextTestItemQueryOptions(testId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getSubmitTestAnswerUrl = (testId: string,) => {




  return `/tests/${testId}/answers`
}

/**
 * Правильность ответа во время теста не раскрывается. `rt_ms`, вставки и потеря фокуса идут в модель времени ответа и флаги (не автоматический провал).
 * @summary Ответ на текущее задание
 */
export const submitTestAnswer = async (testId: string,
    answerSubmit: AnswerSubmit, options?: Parameters<typeof apiFetch>[1]): Promise<AnswerAck> => {

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
return apiFetch<AnswerAck>(getSubmitTestAnswerUrl(testId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(answerSubmit)
  }
);}





export const getSubmitTestAnswerMutationKey = () => ['submitTestAnswer'] as const;

export const getSubmitTestAnswerMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof submitTestAnswer>>, TError,SubmitTestAnswerMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof submitTestAnswer>>, TError,SubmitTestAnswerMutationVariables, TContext> => {

const mutationKey = getSubmitTestAnswerMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof submitTestAnswer>>, SubmitTestAnswerMutationVariables> = (props) => {
          const {testId,data} = props ?? {};

          return  submitTestAnswer(testId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type SubmitTestAnswerMutationResult = NonNullable<Awaited<ReturnType<typeof submitTestAnswer>>>
    export type SubmitTestAnswerMutationBody = BodyType<AnswerSubmit>
    export type SubmitTestAnswerMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem | ValidationErrorResponse>
    export type SubmitTestAnswerMutationVariables = {testId: string;data: BodyType<AnswerSubmit>}

    /**
 * @summary Ответ на текущее задание
 */
export const useSubmitTestAnswer = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | Problem | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof submitTestAnswer>>, TError,SubmitTestAnswerMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof submitTestAnswer>>,
        TError,
        SubmitTestAnswerMutationVariables,
        TContext
      > => {
      return useMutation(getSubmitTestAnswerMutationOptions(options), queryClient);
    }
    export const getRunTestCodeUrl = (testId: string,) => {




  return `/tests/${testId}/run`
}

/**
 * @summary Прогнать код практического задания на открытых тестах (песочница)
 */
export const runTestCode = async (testId: string,
    codeRunRequest: CodeRunRequest, options?: Parameters<typeof apiFetch>[1]): Promise<CodeRunResult> => {

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
return apiFetch<CodeRunResult>(getRunTestCodeUrl(testId),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(codeRunRequest)
  }
);}





export const getRunTestCodeMutationKey = () => ['runTestCode'] as const;

export const getRunTestCodeMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse | TooManyRequestsResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof runTestCode>>, TError,RunTestCodeMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof runTestCode>>, TError,RunTestCodeMutationVariables, TContext> => {

const mutationKey = getRunTestCodeMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof runTestCode>>, RunTestCodeMutationVariables> = (props) => {
          const {testId,data} = props ?? {};

          return  runTestCode(testId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type RunTestCodeMutationResult = NonNullable<Awaited<ReturnType<typeof runTestCode>>>
    export type RunTestCodeMutationBody = BodyType<CodeRunRequest>
    export type RunTestCodeMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse | TooManyRequestsResponse>
    export type RunTestCodeMutationVariables = {testId: string;data: BodyType<CodeRunRequest>}

    /**
 * @summary Прогнать код практического задания на открытых тестах (песочница)
 */
export const useRunTestCode = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse | TooManyRequestsResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof runTestCode>>, TError,RunTestCodeMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof runTestCode>>,
        TError,
        RunTestCodeMutationVariables,
        TContext
      > => {
      return useMutation(getRunTestCodeMutationOptions(options), queryClient);
    }
    export const getFinishTestUrl = (testId: string,) => {




  return `/tests/${testId}/finish`
}

/**
 * Можно вызвать досрочно (оставшиеся задания считаются пропущенными). Повторный вызов возвращает тот же результат.
 * @summary Завершить тест и получить результат
 */
export const finishTest = async (testId: string, options?: Parameters<typeof apiFetch>[1]): Promise<TestResult> => {

  return apiFetch<TestResult>(getFinishTestUrl(testId),
  {
    ...options,
    method: 'POST'


  }
);}





export const getFinishTestMutationKey = () => ['finishTest'] as const;

export const getFinishTestMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof finishTest>>, TError,FinishTestMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof finishTest>>, TError,FinishTestMutationVariables, TContext> => {

const mutationKey = getFinishTestMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof finishTest>>, FinishTestMutationVariables> = (props) => {
          const {testId} = props ?? {};

          return  finishTest(testId,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type FinishTestMutationResult = NonNullable<Awaited<ReturnType<typeof finishTest>>>

    export type FinishTestMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse>
    export type FinishTestMutationVariables = {testId: string}

    /**
 * @summary Завершить тест и получить результат
 */
export const useFinishTest = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof finishTest>>, TError,FinishTestMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof finishTest>>,
        TError,
        FinishTestMutationVariables,
        TContext
      > => {
      return useMutation(getFinishTestMutationOptions(options), queryClient);
    }
    export const getGetTestResultUrl = (testId: string,) => {




  return `/tests/${testId}/result`
}

/**
 * @summary Результат завершённого теста
 */
export const getTestResult = async (testId: string, options?: Parameters<typeof apiFetch>[1]): Promise<TestResult> => {

  return apiFetch<TestResult>(getGetTestResultUrl(testId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetTestResultQueryKey = (testId: string,) => {
    return [
    `/tests/${testId}/result`
    ] as const;
    }


export const getGetTestResultQueryOptions = <TData = Awaited<ReturnType<typeof getTestResult>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTestResult>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetTestResultQueryKey(testId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getTestResult>>> = ({ signal }) => getTestResult(testId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: testId !== null && testId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getTestResult>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetTestResultQueryResult = NonNullable<Awaited<ReturnType<typeof getTestResult>>>
export type GetTestResultQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>


export function useGetTestResult<TData = Awaited<ReturnType<typeof getTestResult>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTestResult>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getTestResult>>,
          TError,
          Awaited<ReturnType<typeof getTestResult>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetTestResult<TData = Awaited<ReturnType<typeof getTestResult>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTestResult>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getTestResult>>,
          TError,
          Awaited<ReturnType<typeof getTestResult>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetTestResult<TData = Awaited<ReturnType<typeof getTestResult>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTestResult>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Результат завершённого теста
 */

export function useGetTestResult<TData = Awaited<ReturnType<typeof getTestResult>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ConflictResponse>>(
 testId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getTestResult>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetTestResultQueryOptions(testId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetMyGradeHistoryUrl = () => {




  return `/me/grade-history`
}

/**
 * @summary История подтверждённых грейдов
 */
export const getMyGradeHistory = async ( options?: Parameters<typeof apiFetch>[1]): Promise<GradeHistoryEntry[]> => {

  return apiFetch<GradeHistoryEntry[]>(getGetMyGradeHistoryUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMyGradeHistoryQueryKey = () => {
    return [
    `/me/grade-history`
    ] as const;
    }


export const getGetMyGradeHistoryQueryOptions = <TData = Awaited<ReturnType<typeof getMyGradeHistory>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyGradeHistory>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMyGradeHistoryQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMyGradeHistory>>> = ({ signal }) => getMyGradeHistory({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMyGradeHistory>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMyGradeHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getMyGradeHistory>>>
export type GetMyGradeHistoryQueryError = ErrorType<UnauthorizedResponse>


export function useGetMyGradeHistory<TData = Awaited<ReturnType<typeof getMyGradeHistory>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyGradeHistory>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyGradeHistory>>,
          TError,
          Awaited<ReturnType<typeof getMyGradeHistory>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyGradeHistory<TData = Awaited<ReturnType<typeof getMyGradeHistory>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyGradeHistory>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMyGradeHistory>>,
          TError,
          Awaited<ReturnType<typeof getMyGradeHistory>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMyGradeHistory<TData = Awaited<ReturnType<typeof getMyGradeHistory>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyGradeHistory>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary История подтверждённых грейдов
 */

export function useGetMyGradeHistory<TData = Awaited<ReturnType<typeof getMyGradeHistory>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMyGradeHistory>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMyGradeHistoryQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getListShowcaseFamiliesUrl = () => {




  return `/assessment/families`
}

/**
 * Только семейства со статусом `showcase`, выведенные из ротации, поэтому показ не создаёт утечку.
 * @summary Витринные семейства заданий (экран «Как работает тест»)
 */
export const listShowcaseFamilies = async ( options?: Parameters<typeof apiFetch>[1]): Promise<ItemFamilyBrief[]> => {

  return apiFetch<ItemFamilyBrief[]>(getListShowcaseFamiliesUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListShowcaseFamiliesQueryKey = () => {
    return [
    `/assessment/families`
    ] as const;
    }


export const getListShowcaseFamiliesQueryOptions = <TData = Awaited<ReturnType<typeof listShowcaseFamilies>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listShowcaseFamilies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListShowcaseFamiliesQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listShowcaseFamilies>>> = ({ signal }) => listShowcaseFamilies({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listShowcaseFamilies>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListShowcaseFamiliesQueryResult = NonNullable<Awaited<ReturnType<typeof listShowcaseFamilies>>>
export type ListShowcaseFamiliesQueryError = ErrorType<UnauthorizedResponse>


export function useListShowcaseFamilies<TData = Awaited<ReturnType<typeof listShowcaseFamilies>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listShowcaseFamilies>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listShowcaseFamilies>>,
          TError,
          Awaited<ReturnType<typeof listShowcaseFamilies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListShowcaseFamilies<TData = Awaited<ReturnType<typeof listShowcaseFamilies>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listShowcaseFamilies>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listShowcaseFamilies>>,
          TError,
          Awaited<ReturnType<typeof listShowcaseFamilies>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListShowcaseFamilies<TData = Awaited<ReturnType<typeof listShowcaseFamilies>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listShowcaseFamilies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Витринные семейства заданий (экран «Как работает тест»)
 */

export function useListShowcaseFamilies<TData = Awaited<ReturnType<typeof listShowcaseFamilies>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listShowcaseFamilies>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListShowcaseFamiliesQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getGetShowcaseFamilyUrl = (familyId: string,) => {




  return `/assessment/families/${familyId}`
}

/**
 * @summary Семейство задания с тремя экземплярами и параметрами IRT
 */
export const getShowcaseFamily = async (familyId: string, options?: Parameters<typeof apiFetch>[1]): Promise<ItemFamily> => {

  return apiFetch<ItemFamily>(getGetShowcaseFamilyUrl(familyId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetShowcaseFamilyQueryKey = (familyId: string,) => {
    return [
    `/assessment/families/${familyId}`
    ] as const;
    }


export const getGetShowcaseFamilyQueryOptions = <TData = Awaited<ReturnType<typeof getShowcaseFamily>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(familyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getShowcaseFamily>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetShowcaseFamilyQueryKey(familyId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getShowcaseFamily>>> = ({ signal }) => getShowcaseFamily(familyId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: familyId !== null && familyId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getShowcaseFamily>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetShowcaseFamilyQueryResult = NonNullable<Awaited<ReturnType<typeof getShowcaseFamily>>>
export type GetShowcaseFamilyQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetShowcaseFamily<TData = Awaited<ReturnType<typeof getShowcaseFamily>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 familyId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getShowcaseFamily>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getShowcaseFamily>>,
          TError,
          Awaited<ReturnType<typeof getShowcaseFamily>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetShowcaseFamily<TData = Awaited<ReturnType<typeof getShowcaseFamily>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 familyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getShowcaseFamily>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getShowcaseFamily>>,
          TError,
          Awaited<ReturnType<typeof getShowcaseFamily>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetShowcaseFamily<TData = Awaited<ReturnType<typeof getShowcaseFamily>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 familyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getShowcaseFamily>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Семейство задания с тремя экземплярами и параметрами IRT
 */

export function useGetShowcaseFamily<TData = Awaited<ReturnType<typeof getShowcaseFamily>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 familyId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getShowcaseFamily>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetShowcaseFamilyQueryOptions(familyId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






