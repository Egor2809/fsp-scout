/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateSkill } from './candidateSkill.js';
import type { Category } from './category.js';
import type { Grade } from './grade.js';
import type { Specialization } from './specialization.js';
import type { TestOutcome } from './testOutcome.js';
import type { TestResultCompetenciesItem } from './testResultCompetenciesItem.js';
import type { TestResultConfidence } from './testResultConfidence.js';
import type { TestResultFlagsItem } from './testResultFlagsItem.js';
import type { TestResultTraceItem } from './testResultTraceItem.js';
import type { TestSuggestion } from './testSuggestion.js';

export interface TestResult {
  test_id: string;
  specialization: Specialization;
  declared_grade: Grade;
  outcome: TestOutcome;
  /** Подтверждённый грейд по итогам. При провале — прежний подтверждённый (не понижается принудительно) или `null` */
  assigned_grade: Grade | null;
  category: Category | null;
  /**
     * Перцентиль θ внутри категории
     * @minimum 1
     * @maximum 99
     * @nullable
     */
  percentile: number | null;
  /** Оценка способности θ (EAP) */
  theta: number;
  /** Стандартная ошибка θ */
  se: number;
  /** Уверенность с учётом SE и флагов */
  confidence: TestResultConfidence;
  confirmed_skills: CandidateSkill[];
  competencies: TestResultCompetenciesItem[];
  suggestion: TestSuggestion;
  flags: TestResultFlagsItem[];
  items_answered: number;
  duration_sec: number;
  finished_at: string;
  /**
     * Повтор на тот же грейд (через 30 дней)
     * @nullable
     */
  next_retake_at: string | null;
  /**
     * Следующая смена подтверждённого грейда (через 90 дней)
     * @nullable
     */
  next_grade_change_at: string | null;
  /** Траектория CAT по заданиям (для графика «как менялась сложность») */
  trace: TestResultTraceItem[];
}
