/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Application } from './application.js';
import type { CandidateCard } from './candidateCard.js';
import type { MatchExplanation } from './matchExplanation.js';

export type EmployerApplication = Application & {
  /** Контакты раскрыты (отклик = согласие на раскрытие этой компании) */
  candidate: CandidateCard;
  explanation: MatchExplanation;
};
