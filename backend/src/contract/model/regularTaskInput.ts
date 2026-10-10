/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage.js';
import type { Grade } from './grade.js';
import type { RubricCriterion } from './rubricCriterion.js';
import type { Specialization } from './specialization.js';
import type { TaskKind } from './taskKind.js';

export interface RegularTaskInput {
  /**
     * @minLength 5
     * @maxLength 120
     */
  title: string;
  /**
     * @minLength 30
     * @maxLength 4000
     */
  description: string;
  kind: TaskKind;
  /** @minItems 1 */
  specializations: Specialization[];
  /** @minItems 1 */
  grades: Grade[];
  /**
     * @minimum 5
     * @maximum 30
     */
  time_limit_min: number;
  language: CodeLanguage | null;
  /**
     * @maxLength 10000
     * @nullable
     */
  starter_code: string | null;
  /**
     * @minItems 1
     * @maxItems 6
     */
  rubric: RubricCriterion[];
  deadline_at: string;
}
