/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { Specialization } from './specialization';

/**
 * Категория «специализация × грейд»
 */
export interface Category {
  specialization: Specialization;
  grade: Grade;
  label: string;
}
