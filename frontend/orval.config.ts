import { defineConfig } from 'orval'

/**
 * Генерация клиента из контракта ../contracts/openapi.yaml:
 *  - React Query хуки + типы моделей (fetch через наш мутатор src/api/http.ts)
 *  - MSW-обработчики со случайными данными (fallback для эндпоинтов без ручного мока)
 *  - zod-схемы ответов (контрактные тесты моков)
 */
export default defineConfig({
  scout: {
    input: { target: '../contracts/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      mock: {
        generators: [{ type: 'msw', delay: false, useExamples: true, locale: 'ru' }],
      },
      override: {
        header: (info) => [`Сгенерировано orval из contracts/openapi.yaml (${info.title} ${info.version}). Не редактировать вручную.`],
        mutator: { path: 'src/api/http.ts', name: 'apiFetch' },
        query: { signal: true },
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
  scoutZod: {
    input: { target: '../contracts/openapi.yaml' },
    output: {
      mode: 'single',
      client: 'zod',
      target: 'src/api/generated/zod/scout.zod.ts',
      clean: true,
      override: {
        header: (info) => [`Сгенерировано orval из contracts/openapi.yaml (${info.title} ${info.version}). Не редактировать вручную.`],
      },
    },
  },
})
