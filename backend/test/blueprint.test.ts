import test from 'node:test';
import assert from 'node:assert/strict';
import { vacancyBlueprint } from '../src/assessment/vacancy-blueprint.ts';
const vacancy = { id: 'v', title: 'Backend', specialization: 'backend' as const, grade: 'middle' as const, mustSkills: ['postgresql'], niceSkills: ['go'] };
test('blueprint weights mandatory skills, exposes uncovered skills and counts actual distinct families', () => {
  const result = vacancyBlueprint(vacancy, new Date('2026-10-10T00:00:00Z'));
  assert.ok(Math.abs(result.competencies.reduce((s, c) => s + c.share, 0) - 1) < 1e-12);
  assert.equal(result.extracted_skills[0].weight, 2 / 3);
  assert.equal(result.competencies.find(c => c.competency_id === 'databases')?.families_count, 5);
  assert.equal(result.competencies.find(c => c.competency_id === 'skill:go')?.families_count, 0);
  assert.equal(result.practice, null);
  assert.equal(result.generated_at, '2026-10-10T00:00:00.000Z');
});
test('empty requirements use actual specialization competencies and duplicate skills do not distort shares', () => {
  const empty = vacancyBlueprint({ ...vacancy, mustSkills: [], niceSkills: [] });
  assert.ok(empty.competencies.length);
  assert.ok(Math.abs(empty.competencies.reduce((s, c) => s + c.share, 0) - 1) < 1e-12);
  const duplicate = vacancyBlueprint({ ...vacancy, mustSkills: ['postgresql', 'postgresql'], niceSkills: ['postgresql', 'go', 'go'] });
  assert.deepEqual(duplicate.extracted_skills, vacancyBlueprint(vacancy).extracted_skills);
});
