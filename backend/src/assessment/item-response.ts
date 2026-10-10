import type { ItemResponse } from '../common/irt.ts';
import { LIVE_BANK } from './live-bank.ts';

export interface ScoredItem {
  discrimination: number;
  difficulty: number;
  correct: boolean | null;
  familyId?: string;
  parameters?: unknown;
}

const families = new Map(LIVE_BANK.map(f => [f.id, f]));

export function itemResponse(item: ScoredItem): ItemResponse {
  if (typeof item.correct !== 'boolean') throw new Error('Unscored response');
  const parameters = item.parameters;
  const saved = parameters !== null && typeof parameters === 'object' && 'irt_c' in parameters ? parameters.irt_c : undefined;
  if (saved !== undefined && (typeof saved !== 'number' || !Number.isFinite(saved) || saved < 0 || saved >= 1)) {
    throw new RangeError('Invalid saved guessing parameter');
  }
  const c = parameters === undefined ? families.get(item.familyId ?? '')?.c ?? 0 : saved ?? 0;
  return { a: item.discrimination, b: item.difficulty, c,
    correct: item.correct, familyId: item.familyId };
}
