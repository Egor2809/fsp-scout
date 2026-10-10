/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CandidateCard } from './candidateCard';
import type { PageMeta } from './pageMeta';

export type CandidatePage = PageMeta & {
  items: CandidateCard[];
};
