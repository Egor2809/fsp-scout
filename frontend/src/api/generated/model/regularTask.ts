/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage';
import type { CompanyBrief } from './companyBrief';
import type { Grade } from './grade';
import type { RegularTaskStatus } from './regularTaskStatus';
import type { RubricCriterion } from './rubricCriterion';
import type { Specialization } from './specialization';
import type { TaskKind } from './taskKind';

export interface RegularTask {
  id: string;
  company: CompanyBrief;
  title: string;
  description: string;
  kind: TaskKind;
  specializations: Specialization[];
  grades: Grade[];
  /**
     * @minimum 5
     * @maximum 30
     */
  time_limit_min: number;
  language: CodeLanguage | null;
  /** @nullable */
  starter_code: string | null;
  rubric: RubricCriterion[];
  status: RegularTaskStatus;
  /** @nullable */
  published_at: string | null;
  deadline_at: string;
  /**
     * Только для работодателя
     * @nullable
     */
  assigned_count: number | null;
  /**
     * Только для работодателя
     * @nullable
     */
  submissions_count: number | null;
}
