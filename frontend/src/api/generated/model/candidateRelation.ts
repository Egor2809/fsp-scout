/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateRelationApplication } from './candidateRelationApplication';
import type { CandidateRelationInvitation } from './candidateRelationInvitation';

/**
 * Отношения кандидата с компанией текущего работодателя
 */
export interface CandidateRelation {
  invitation: CandidateRelationInvitation;
  application: CandidateRelationApplication;
}
