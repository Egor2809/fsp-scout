import type { CandidateSkill } from '../contract/model/index.js';

/** Versioned product rule; this does not claim empirical skill calibration. */
export const SKILL_CONFIRMATION_POLICY = { version: 'independent-families-v1', minFamilies: 3, minScore: 80 } as const;

export function confirmedSkills(
  passed: boolean,
  items: readonly { familyId: string; block: string; correct: boolean | null; answeredAt: Date | null }[],
  families: readonly { id: string; skillIds: readonly string[] }[],
  names: ReadonlyMap<string, { name: string }>,
): CandidateSkill[] {
  if (!passed) return [];
  const metadata = new Map(families.map(f => [f.id, f]));
  const evidence = new Map<string, Map<string, boolean>>();
  for (const item of items) {
    if (item.block !== 'adaptive' || item.answeredAt === null || typeof item.correct !== 'boolean') continue;
    for (const skill of metadata.get(item.familyId)?.skillIds ?? []) {
      if (!names.has(skill)) continue;
      const observations = evidence.get(skill) ?? new Map<string, boolean>();
      // Repeated variants cannot inflate support; conflicting duplicates fail conservatively.
      observations.set(item.familyId, (observations.get(item.familyId) ?? true) && item.correct);
      evidence.set(skill, observations);
    }
  }
  return [...evidence].sort(([a], [b]) => a.localeCompare(b)).flatMap(([skill, observations]) => {
    const ratio = [...observations.values()].filter(Boolean).length / observations.size;
    if (observations.size < SKILL_CONFIRMATION_POLICY.minFamilies || ratio * 100 < SKILL_CONFIRMATION_POLICY.minScore) return [];
    return [{ skill_id: skill, name: names.get(skill)!.name, level: 'basic' as const,
      source: 'test' as const, verified: true, score: Math.round(ratio * 100) }];
  });
}
