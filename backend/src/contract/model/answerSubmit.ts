/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Answer } from './answer.js';

export interface AnswerSubmit {
  instance_id: string;
  answer: Answer;
  /**
     * Время ответа, мс
     * @minimum 0
     */
  rt_ms: number;
  /**
     * Вставок из буфера на этом задании
     * @minimum 0
     */
  paste_count: number;
  /**
     * Потерь фокуса вкладки на этом задании
     * @minimum 0
     */
  focus_lost_count: number;
}
