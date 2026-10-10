/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';

export type GetSalaryRadarParams = {
specialization: Specialization;
grade: Grade;
/**
 * @minimum 10000
 */
salary_from: number;
/**
 * @minimum 10000
 */
salary_to: number;
};
