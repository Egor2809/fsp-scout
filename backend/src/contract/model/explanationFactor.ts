/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FactorKind } from './factorKind.js';
import type { Polarity } from './polarity.js';

/**
 * Вклад фактора в скоринг: `{factor, value, contribution, evidence}`
 */
export interface ExplanationFactor {
  kind: FactorKind;
  label: string;
  /** Вклад в итоговый Score, пункты (со знаком) */
  contribution: number;
  polarity: Polarity;
  /** @nullable */
  evidence: string | null;
}
