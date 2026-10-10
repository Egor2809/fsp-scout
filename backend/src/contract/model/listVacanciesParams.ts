/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { PageParameter } from './pageParameter.js';
import type { PageSizeParameter } from './pageSizeParameter.js';
import type { Specialization } from './specialization.js';
import type { WorkFormat } from './workFormat.js';

export type ListVacanciesParams = {
specialization?: Specialization;
grade?: Grade;
work_format?: WorkFormat;
/**
 * @maxLength 100
 */
q?: string;
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
