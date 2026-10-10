/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FspLevel } from './fspLevel';
import type { Grade } from './grade';
import type { ListCandidatesSort } from './listCandidatesSort';
import type { PageParameter } from './pageParameter';
import type { PageSizeParameter } from './pageSizeParameter';
import type { Specialization } from './specialization';
import type { WorkFormat } from './workFormat';

export type ListCandidatesParams = {
specialization?: Specialization;
/**
 * Можно несколько
 */
grade?: Grade[];
/**
 * ID навыков, кандидат должен иметь все
 */
skill?: string[];
work_format?: WorkFormat[];
/**
 * @maxLength 100
 */
city?: string;
/**
 * Только с достижениями ФСП
 */
fsp_only?: boolean;
/**
 * Минимальный уровень достижения ФСП
 */
fsp_level_min?: FspLevel;
/**
 * Только с подтверждённым грейдом (по умолчанию да)
 */
verified_only?: boolean;
/**
 * Актуальность — был активен за N дней
 * @minimum 1
 * @maximum 365
 */
active_within_days?: number;
sort?: ListCandidatesSort;
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
