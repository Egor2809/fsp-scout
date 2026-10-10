/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type CandidateCardTaskSignal = {
  /** Бейдж «свежий сигнал» за хорошее решение регулярного задания */
  fresh: boolean;
  /** @minimum 0 */
  solved_count: number;
  /** @nullable */
  last_solved_at: string | null;
};
