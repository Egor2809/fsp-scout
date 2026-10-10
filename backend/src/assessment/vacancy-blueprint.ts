import type { Grade, Specialization, TestBlueprint } from '../contract/model/index.js';
import { skillRef } from '../common/taxonomy-data.ts';
import { LIVE_BANK } from './live-bank.ts';
import { DEFAULT_POLICY } from './session-state.ts';

interface VacancyBlueprintInput {
  id: string; title: string; specialization: Specialization; grade: Grade;
  mustSkills: readonly string[]; niceSkills: readonly string[];
}
const names: Record<string, string> = { databases: 'Базы данных', systems: 'Системы', quality: 'Качество', algorithms: 'Алгоритмы', statistics: 'Статистика' };

/** A transparent plan, including zero-family gaps; never claims the bank is ready. */
export function vacancyBlueprint(v: VacancyBlueprintInput, now = new Date()): TestBlueprint {
  const bank = LIVE_BANK.filter(f => f.specializations.includes(v.specialization));
  const must = [...new Set(v.mustSkills)];
  const nice = [...new Set(v.niceSkills)].filter(id => !must.includes(id));
  const extracted = [...must.map(id => ({ id, weight: 2, importance: 'must' as const })), ...nice.map(id => ({ id, weight: 1, importance: 'nice' as const }))];
  const total = extracted.reduce((sum, skill) => sum + skill.weight, 0);
  const groups = new Map<string, { weight: number; skills: Set<string>; familyIds: Set<string> }>();
  for (const skill of extracted) {
    const families = bank.filter(f => f.skillIds.includes(skill.id));
    const competencies = [...new Set(families.map(f => f.competency))];
    if (!competencies.length) competencies.push(`skill:${skill.id}`);
    for (const id of competencies) {
      const group = groups.get(id) ?? { weight: 0, skills: new Set<string>(), familyIds: new Set<string>() };
      group.weight += skill.weight / competencies.length;
      group.skills.add(skill.id);
      for (const f of families.filter(f => f.competency === id)) group.familyIds.add(f.id);
      groups.set(id, group);
    }
  }
  if (!groups.size) for (const family of bank) {
    const group = groups.get(family.competency) ?? { weight: 1, skills: new Set<string>(), familyIds: new Set<string>() };
    group.familyIds.add(family.id);
    groups.set(family.competency, group);
  }
  const denominator = total || groups.size;
  return { vacancy_id: v.id, vacancy_title: v.title, specialization: v.specialization, grade: v.grade,
    extracted_skills: extracted.map(s => ({ skill: skillRef(s.id), weight: s.weight / total, importance: s.importance })),
    competencies: [...groups].map(([id, group]) => ({ competency_id: id,
      name: id.startsWith('skill:') ? skillRef(id.slice(6)).name : names[id] ?? id,
      share: group.weight / denominator, families_count: group.familyIds.size, skills: [...group.skills].map(skillRef) })),
    adaptive_items: { min: DEFAULT_POLICY.min, max: DEFAULT_POLICY.max }, practice: null, generated_at: now.toISOString() };
}
