/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';

/**
 * Категория «специализация × грейд»
 */
export interface Category {
  specialization: Specialization;
  grade: Grade;
  label: string;
}
