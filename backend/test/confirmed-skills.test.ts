import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmedSkills } from '../src/assessment/confirmed-skills.ts';

test('skill confirmation requires independent families, sufficient accuracy and a passed test', () => {
  const names = new Map([['sql', { name: 'SQL' }]]);
  const families = Array.from({ length: 5 }, (_, i) => ({ id: String(i), skillIds: ['sql', 'unknown'] }));
  const items = families.map(f => ({ familyId: f.id, block: 'adaptive', correct: true, answeredAt: new Date(0) }));
  assert.deepEqual(confirmedSkills(true, items, families, names), [{ skill_id: 'sql', name: 'SQL', level: 'basic', source: 'test', verified: true, score: 100 }]);
  assert.equal(confirmedSkills(false, items, families, names).length, 0);
  assert.equal(confirmedSkills(true, items.slice(0, 2), families, names).length, 0);
  assert.equal(confirmedSkills(true, Array(5).fill(items[0]), families, names).length, 0);
  const oneWrong = items.map((x, i) => ({ ...x, correct: i !== 0 }));
  assert.equal(confirmedSkills(true, oneWrong, families, names)[0]?.score, 80);
  assert.equal(confirmedSkills(true, oneWrong.slice(0, 4), families, names).length, 0);
  assert.equal(confirmedSkills(true, items.map(x => ({ ...x, block: 'practice' })), families, names).length, 0);
  assert.equal(confirmedSkills(true, items.map(x => ({ ...x, correct: null })), families, names).length, 0);
  assert.equal(confirmedSkills(true, items.map(x => ({ ...x, answeredAt: null })), families, names).length, 0);
});
