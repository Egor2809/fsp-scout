/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { PageParameter } from './pageParameter.js';
import type { PageSizeParameter } from './pageSizeParameter.js';

export type GetSearchResultsParams = {
/**
 * По умолчанию — текущая версия
 * @minimum 1
 */
version?: number;
/**
 * @minimum 1
 */
page?: PageParameter;
/**
 * @minimum 1
 * @maximum 100
 */
page_size?: PageSizeParameter;
};
