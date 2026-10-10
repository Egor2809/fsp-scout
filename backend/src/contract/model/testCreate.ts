/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';

export interface TestCreate {
  declared_grade: Grade;
  /** По умолчанию из последнего опроса */
  specialization?: Specialization;
  /**
     * Построить бланк теста под вакансию
     * @nullable
     */
  vacancy_id?: string | null;
  /** Экспресс-тест для жюри на 5–6 вопросов без практики. Доступен, только если на стенде включён ASSESSMENT_EXPRESS; категорию не подтверждает */
  express?: boolean;
}
