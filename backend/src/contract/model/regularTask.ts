/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage.js';
import type { CompanyBrief } from './companyBrief.js';
import type { Grade } from './grade.js';
import type { RegularTaskStatus } from './regularTaskStatus.js';
import type { RubricCriterion } from './rubricCriterion.js';
import type { Specialization } from './specialization.js';
import type { TaskKind } from './taskKind.js';

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
