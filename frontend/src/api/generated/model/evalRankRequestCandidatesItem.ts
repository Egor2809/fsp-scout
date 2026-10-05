/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Grade } from './grade';

export type EvalRankRequestCandidatesItem = {
  id: string;
  /**
     * Текст резюме или JSON Resume, сериализованный в строку
     * @maxLength 20000
     */
  text: string;
  grade?: Grade | null;
};
