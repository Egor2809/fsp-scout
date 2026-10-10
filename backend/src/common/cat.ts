import { estimate, information, type ItemParameters, type ItemResponse } from './irt.ts';

export interface Family extends ItemParameters { id: string; competency: string }
export interface CatPolicy { min: number; max: number; targetSe: number; topK: number; maxExposure: number; competencyWeights?: Record<string, number>; choiceShare?: number }
export interface CatState { responses: ItemResponse[]; servedIds: string[]; competencyCounts: Record<string, number> }

export function selectFamily(
  bank: readonly Family[], state: CatState, policy: CatPolicy,
  exposure: Readonly<Record<string, number>>, requiredCompetencies: readonly string[], random: () => number,
): { family: Family | null; reason: 'precision' | 'max_length' | 'selected' | 'bank_exhausted' | 'exposure_exhausted' | 'coverage_unavailable' } {
  if (!Number.isInteger(policy.min) || policy.min < 1 || policy.max < policy.min || !Number.isInteger(policy.max)
      || !Number.isFinite(policy.targetSe) || policy.targetSe <= 0 || !Number.isInteger(policy.topK) || policy.topK < 1 || !Number.isFinite(policy.maxExposure) || policy.maxExposure <= 0 || policy.maxExposure > 1) {
    throw new RangeError('Invalid CAT policy');
  }
  const byId = new Map(bank.map(f => [f.id, f]));
  const posterior = estimate(state.responses.map((r, index) => ({ ...r,
    c: r.c ?? byId.get(r.familyId ?? state.servedIds[index] ?? '')?.c ?? 0,
  })));
  const missing = requiredCompetencies.filter(id => !state.competencyCounts[id]);
  if (state.responses.length >= policy.max) return { family: null, reason: missing.length ? 'coverage_unavailable' : 'max_length' };
  if (state.responses.length >= policy.min && posterior.se <= policy.targetSe && missing.length === 0) return { family: null, reason: 'precision' };
  const available = bank.filter(f => !state.servedIds.includes(f.id));
  if (!available.length) return { family: null, reason: 'bank_exhausted' };
  const eligible = available.filter(f => (exposure[f.id] ?? 0) < policy.maxExposure);
  if (!eligible.length) return { family: null, reason: 'exposure_exhausted' };
  // Coverage gets priority before selecting by information.
  const forCoverage = eligible.filter(f => missing.includes(f.competency));
  if (missing.length && !forCoverage.length) return { family: null, reason: 'coverage_unavailable' };
  let pool = forCoverage.length ? forCoverage : eligible;
  if (policy.competencyWeights) {
    const weights = policy.competencyWeights;
    if (Object.values(weights).some(w => !Number.isFinite(w) || w <= 0)
      || Math.abs(Object.values(weights).reduce((sum, w) => sum + w, 0) - 1) > 1e-8
      || requiredCompetencies.some(id => !weights[id])) throw new RangeError('Invalid competency weights');
    pool = pool.filter(f => weights[f.competency] !== undefined);
    if (!pool.length) return { family: null, reason: 'coverage_unavailable' };
    const deficit = (f: Family) => weights[f.competency]! * (state.responses.length + 1) - (state.competencyCounts[f.competency] ?? 0);
    const maximum = Math.max(...pool.map(deficit));
    pool = pool.filter(f => Math.abs(deficit(f) - maximum) < 1e-10);
  }
  if (policy.choiceShare) {
    const served = state.servedIds.filter(id => (byId.get(id)?.c ?? 0) > 0).length;
    const choice = pool.filter(f => (f.c ?? 0) > 0);
    if (choice.length && served < Math.floor(policy.choiceShare * (state.responses.length + 1))) pool = choice;
  }
  const choices = pool
    .map(family => ({ family, information: information(posterior.theta, family) }))
    .sort((a, b) => b.information - a.information || a.family.id.localeCompare(b.family.id))
    .slice(0, policy.topK);
  const draw = random();
  if (draw < 0 || draw >= 1 || !Number.isFinite(draw)) throw new RangeError('Invalid random draw');
  return { family: choices[Math.floor(draw * choices.length)]!.family, reason: 'selected' };
}

/** Coverage of a competency whose unserved families are all at the exposure ceiling is waived, never forced. */
export function selectWithWaiver(
  bank: readonly Family[], state: CatState, policy: CatPolicy,
  exposure: Readonly<Record<string, number>>, requiredCompetencies: readonly string[], random: () => number,
) {
  const waived: string[] = [];
  let choice = selectFamily(bank, state, policy, exposure, requiredCompetencies, random);
  while (choice.reason === 'coverage_unavailable' && state.responses.length < policy.max) {
    const blocked = requiredCompetencies.filter(id => !state.competencyCounts[id] && !waived.includes(id)
      && bank.filter(f => f.competency === id && !state.servedIds.includes(f.id)).every(f => (exposure[f.id] ?? 0) >= policy.maxExposure));
    if (!blocked.length) break;
    waived.push(...blocked);
    choice = selectFamily(bank, state, policy, exposure, requiredCompetencies.filter(id => !waived.includes(id)), random);
  }
  return { ...choice, waived };
}

export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let x = value;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GeneratedItem {
  familyId: string;
  templateVersion: number;
  parameters: { rows: number; groups: number };
  publicItem: { type: 'short_answer'; prompt: string };
  expectedAnswer: string;
}

/** Expert-designed isomorphic SQL count family; no claim of empirical calibration. */
export function generateCountFamily(seed: number): GeneratedItem {
  const random = seededRandom(seed);
  const groups = 2 + Math.floor(random() * 8);
  const rows = groups * (2 + Math.floor(random() * 10));
  return {
    familyId: 'sql-distinct-count', templateVersion: 1, parameters: { rows, groups },
    publicItem: { type: 'short_answer', prompt: `В таблице events ${rows} строк. Поле category принимает ровно ${groups} различных ненулевых значений, каждое встречается одинаковое число раз. Что вернёт SELECT COUNT(DISTINCT category) FROM events?` },
    expectedAnswer: String(groups),
  };
}
