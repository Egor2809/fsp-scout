/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { PageParameter } from './pageParameter';
import type { PageSizeParameter } from './pageSizeParameter';
import type { Specialization } from './specialization';
import type { WorkFormat } from './workFormat';

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
