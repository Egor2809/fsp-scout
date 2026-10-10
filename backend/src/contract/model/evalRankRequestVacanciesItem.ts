/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { SalaryRange } from './salaryRange.js';

export type EvalRankRequestVacanciesItem = {
  id: string;
  /** @maxLength 8000 */
  text: string;
  salary?: SalaryRange | null;
};
