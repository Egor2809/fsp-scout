/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage.js';
import type { TaskSubmissionStatus } from './taskSubmissionStatus.js';

export interface TaskSubmission {
  id: string;
  task_id: string;
  submitted_at: string;
  /** @nullable */
  answer_text: string | null;
  /** @nullable */
  code: string | null;
  language: CodeLanguage | null;
  status: TaskSubmissionStatus;
  /**
     * Предварительная оценка по рубрике (LLM)
     * @minimum 0
     * @maximum 100
     * @nullable
     */
  llm_score: number | null;
  /**
     * Итоговая оценка работодателя
     * @minimum 0
     * @maximum 100
     * @nullable
     */
  final_score: number | null;
  /** Решение дало бейдж «свежий сигнал» */
  fresh_signal: boolean;
  /** @nullable */
  feedback: string | null;
}
