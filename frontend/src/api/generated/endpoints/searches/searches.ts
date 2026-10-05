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
  GetSearchResultsParams,
  NotFoundResponse,
  Search,
  SearchCreate,
  SearchRefine,
  SearchResults,
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

export const getListSearchesUrl = () => {




  return `/searches`
}

/**
 * @summary Подборки компании (новые сверху)
 */
export const listSearches = async ( options?: Parameters<typeof apiFetch>[1]): Promise<Search[]> => {

  return apiFetch<Search[]>(getListSearchesUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListSearchesQueryKey = () => {
    return [
    `/searches`
    ] as const;
    }


export const getListSearchesQueryOptions = <TData = Awaited<ReturnType<typeof listSearches>>, TError = ErrorType<UnauthorizedResponse>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSearches>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListSearchesQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listSearches>>> = ({ signal }) => listSearches({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listSearches>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListSearchesQueryResult = NonNullable<Awaited<ReturnType<typeof listSearches>>>
export type ListSearchesQueryError = ErrorType<UnauthorizedResponse>


export function useListSearches<TData = Awaited<ReturnType<typeof listSearches>>, TError = ErrorType<UnauthorizedResponse>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSearches>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listSearches>>,
          TError,
          Awaited<ReturnType<typeof listSearches>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListSearches<TData = Awaited<ReturnType<typeof listSearches>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSearches>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listSearches>>,
          TError,
          Awaited<ReturnType<typeof listSearches>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListSearches<TData = Awaited<ReturnType<typeof listSearches>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSearches>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Подборки компании (новые сверху)
 */

export function useListSearches<TData = Awaited<ReturnType<typeof listSearches>>, TError = ErrorType<UnauthorizedResponse>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSearches>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListSearchesQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getCreateSearchUrl = () => {




  return `/searches`
}

/**
 * @summary Создать подборку (версия 1)
 */
export const createSearch = async (searchCreate: SearchCreate, options?: Parameters<typeof apiFetch>[1]): Promise<Search> => {

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
return apiFetch<Search>(getCreateSearchUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(searchCreate)
  }
);}





export const getCreateSearchMutationKey = () => ['createSearch'] as const;

export const getCreateSearchMutationOptions = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createSearch>>, TError,CreateSearchMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createSearch>>, TError,CreateSearchMutationVariables, TContext> => {

const mutationKey = getCreateSearchMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createSearch>>, CreateSearchMutationVariables> = (props) => {
          const {data} = props ?? {};

          return  createSearch(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateSearchMutationResult = NonNullable<Awaited<ReturnType<typeof createSearch>>>
    export type CreateSearchMutationBody = BodyType<SearchCreate>
    export type CreateSearchMutationError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>
    export type CreateSearchMutationVariables = {data: BodyType<SearchCreate>}

    /**
 * @summary Создать подборку (версия 1)
 */
export const useCreateSearch = <TError = ErrorType<UnauthorizedResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createSearch>>, TError,CreateSearchMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createSearch>>,
        TError,
        CreateSearchMutationVariables,
        TContext
      > => {
      return useMutation(getCreateSearchMutationOptions(options), queryClient);
    }
    export const getGetSearchUrl = (searchId: string,) => {




  return `/searches/${searchId}`
}

/**
 * @summary Подборка с версиями и шорт-листом
 */
export const getSearch = async (searchId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Search> => {

  return apiFetch<Search>(getGetSearchUrl(searchId),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetSearchQueryKey = (searchId: string,) => {
    return [
    `/searches/${searchId}`
    ] as const;
    }


export const getGetSearchQueryOptions = <TData = Awaited<ReturnType<typeof getSearch>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(searchId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearch>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetSearchQueryKey(searchId);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getSearch>>> = ({ signal }) => getSearch(searchId, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: searchId !== null && searchId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getSearch>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetSearchQueryResult = NonNullable<Awaited<ReturnType<typeof getSearch>>>
export type GetSearchQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetSearch<TData = Awaited<ReturnType<typeof getSearch>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearch>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSearch>>,
          TError,
          Awaited<ReturnType<typeof getSearch>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSearch<TData = Awaited<ReturnType<typeof getSearch>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearch>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSearch>>,
          TError,
          Awaited<ReturnType<typeof getSearch>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSearch<TData = Awaited<ReturnType<typeof getSearch>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearch>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Подборка с версиями и шорт-листом
 */

export function useGetSearch<TData = Awaited<ReturnType<typeof getSearch>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearch>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetSearchQueryOptions(searchId,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getRefineSearchUrl = (searchId: string,) => {




  return `/searches/${searchId}`
}

/**
 * @summary Уточнить фильтры — создаёт новую версию, шорт-лист сохраняется
 */
export const refineSearch = async (searchId: string,
    searchRefine: SearchRefine, options?: Parameters<typeof apiFetch>[1]): Promise<Search> => {

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
return apiFetch<Search>(getRefineSearchUrl(searchId),
  {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getHeaders(options?.headers) },
    body: JSON.stringify(searchRefine)
  }
);}





export const getRefineSearchMutationKey = () => ['refineSearch'] as const;

export const getRefineSearchMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof refineSearch>>, TError,RefineSearchMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof refineSearch>>, TError,RefineSearchMutationVariables, TContext> => {

const mutationKey = getRefineSearchMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof refineSearch>>, RefineSearchMutationVariables> = (props) => {
          const {searchId,data} = props ?? {};

          return  refineSearch(searchId,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type RefineSearchMutationResult = NonNullable<Awaited<ReturnType<typeof refineSearch>>>
    export type RefineSearchMutationBody = BodyType<SearchRefine>
    export type RefineSearchMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>
    export type RefineSearchMutationVariables = {searchId: string;data: BodyType<SearchRefine>}

    /**
 * @summary Уточнить фильтры — создаёт новую версию, шорт-лист сохраняется
 */
export const useRefineSearch = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse | ValidationErrorResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof refineSearch>>, TError,RefineSearchMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof refineSearch>>,
        TError,
        RefineSearchMutationVariables,
        TContext
      > => {
      return useMutation(getRefineSearchMutationOptions(options), queryClient);
    }
    export const getGetSearchResultsUrl = (searchId: string,
    params?: GetSearchResultsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/searches/${searchId}/results?${stringifiedParams}` : `/searches/${searchId}/results`
}

/**
 * @summary Ранжированная выдача версии с объяснениями
 */
export const getSearchResults = async (searchId: string,
    params?: GetSearchResultsParams, options?: Parameters<typeof apiFetch>[1]): Promise<SearchResults> => {

  return apiFetch<SearchResults>(getGetSearchResultsUrl(searchId,params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetSearchResultsQueryKey = (searchId: string,
    params?: GetSearchResultsParams,) => {
    return [
    `/searches/${searchId}/results`, ...(params ? [params] : [])
    ] as const;
    }


export const getGetSearchResultsQueryOptions = <TData = Awaited<ReturnType<typeof getSearchResults>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(searchId: string,
    params?: GetSearchResultsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearchResults>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetSearchResultsQueryKey(searchId,params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getSearchResults>>> = ({ signal }) => getSearchResults(searchId,params, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: searchId !== null && searchId !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getSearchResults>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetSearchResultsQueryResult = NonNullable<Awaited<ReturnType<typeof getSearchResults>>>
export type GetSearchResultsQueryError = ErrorType<UnauthorizedResponse | NotFoundResponse>


export function useGetSearchResults<TData = Awaited<ReturnType<typeof getSearchResults>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string,
    params: undefined |  GetSearchResultsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearchResults>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSearchResults>>,
          TError,
          Awaited<ReturnType<typeof getSearchResults>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSearchResults<TData = Awaited<ReturnType<typeof getSearchResults>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string,
    params?: GetSearchResultsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearchResults>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSearchResults>>,
          TError,
          Awaited<ReturnType<typeof getSearchResults>>
        > , 'initialData'
      >, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSearchResults<TData = Awaited<ReturnType<typeof getSearchResults>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string,
    params?: GetSearchResultsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearchResults>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Ранжированная выдача версии с объяснениями
 */

export function useGetSearchResults<TData = Awaited<ReturnType<typeof getSearchResults>>, TError = ErrorType<UnauthorizedResponse | NotFoundResponse>>(
 searchId: string,
    params?: GetSearchResultsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSearchResults>>, TError, TData>>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetSearchResultsQueryOptions(searchId,params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return withQueryKey(query, queryOptions.queryKey);
}






export const getAddToShortlistUrl = (searchId: string,
    candidateId: string,) => {




  return `/searches/${searchId}/shortlist/${candidateId}`
}

/**
 * @summary Добавить кандидата в шорт-лист (идемпотентно)
 */
export const addToShortlist = async (searchId: string,
    candidateId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Search> => {

  return apiFetch<Search>(getAddToShortlistUrl(searchId,candidateId),
  {
    ...options,
    method: 'PUT'


  }
);}





export const getAddToShortlistMutationKey = () => ['addToShortlist'] as const;

export const getAddToShortlistMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof addToShortlist>>, TError,AddToShortlistMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof addToShortlist>>, TError,AddToShortlistMutationVariables, TContext> => {

const mutationKey = getAddToShortlistMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof addToShortlist>>, AddToShortlistMutationVariables> = (props) => {
          const {searchId,candidateId} = props ?? {};

          return  addToShortlist(searchId,candidateId,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type AddToShortlistMutationResult = NonNullable<Awaited<ReturnType<typeof addToShortlist>>>

    export type AddToShortlistMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse>
    export type AddToShortlistMutationVariables = {searchId: string;candidateId: string}

    /**
 * @summary Добавить кандидата в шорт-лист (идемпотентно)
 */
export const useAddToShortlist = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof addToShortlist>>, TError,AddToShortlistMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof addToShortlist>>,
        TError,
        AddToShortlistMutationVariables,
        TContext
      > => {
      return useMutation(getAddToShortlistMutationOptions(options), queryClient);
    }
    export const getRemoveFromShortlistUrl = (searchId: string,
    candidateId: string,) => {




  return `/searches/${searchId}/shortlist/${candidateId}`
}

/**
 * @summary Убрать кандидата из шорт-листа (идемпотентно)
 */
export const removeFromShortlist = async (searchId: string,
    candidateId: string, options?: Parameters<typeof apiFetch>[1]): Promise<Search> => {

  return apiFetch<Search>(getRemoveFromShortlistUrl(searchId,candidateId),
  {
    ...options,
    method: 'DELETE'


  }
);}





export const getRemoveFromShortlistMutationKey = () => ['removeFromShortlist'] as const;

export const getRemoveFromShortlistMutationOptions = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof removeFromShortlist>>, TError,RemoveFromShortlistMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof removeFromShortlist>>, TError,RemoveFromShortlistMutationVariables, TContext> => {

const mutationKey = getRemoveFromShortlistMutationKey();
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof removeFromShortlist>>, RemoveFromShortlistMutationVariables> = (props) => {
          const {searchId,candidateId} = props ?? {};

          return  removeFromShortlist(searchId,candidateId,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type RemoveFromShortlistMutationResult = NonNullable<Awaited<ReturnType<typeof removeFromShortlist>>>

    export type RemoveFromShortlistMutationError = ErrorType<UnauthorizedResponse | NotFoundResponse>
    export type RemoveFromShortlistMutationVariables = {searchId: string;candidateId: string}

    /**
 * @summary Убрать кандидата из шорт-листа (идемпотентно)
 */
export const useRemoveFromShortlist = <TError = ErrorType<UnauthorizedResponse | NotFoundResponse>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof removeFromShortlist>>, TError,RemoveFromShortlistMutationVariables, TContext>, request?: SecondParameter<typeof apiFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof removeFromShortlist>>,
        TError,
        RemoveFromShortlistMutationVariables,
        TContext
      > => {
      return useMutation(getRemoveFromShortlistMutationOptions(options), queryClient);
    }
