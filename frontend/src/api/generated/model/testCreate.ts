/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';
import type { Specialization } from './specialization';

export interface TestCreate {
  declared_grade: Grade;
  /** По умолчанию из последнего опроса */
  specialization?: Specialization;
  /**
     * Построить бланк теста под вакансию
     * @nullable
     */
  vacancy_id?: string | null;
}
