import test from 'node:test';
import assert from 'node:assert/strict';
import { seededRandom } from '../src/common/cat.ts';
import { LIVE_BANK, instantiate } from '../src/assessment/live-bank.ts';
import { gradeAnswer } from '../src/assessment/grading.ts';

test('a 300-instance dump guesses at most 30% per choice family and 35% across the bank', t => {
  const random = seededRandom(20261010 ^ 0x1eaf), seed = () => Math.floor(random() * 2147483647);
  const keyOf = (instance: ReturnType<typeof instantiate>) => {
    const expected = instance.expectedAnswer;
    if (expected.kind === 'numeric') return String(expected.value);
    if (expected.kind === 'options') return instance.publicItem.options!.filter(o => expected.ids.includes(o.id)).map(o => o.text).sort().join('\u0000');
    throw new Error('Unexpected key');
  };
  const dumps = new Map(LIVE_BANK.map(family => {
    const prompts = new Set<string>(), counts = new Map<string, number>();
    for (let i = 0; i < 300; i++) {
      const instance = instantiate(family, seed(), 'dump', 1), key = keyOf(instance);
      prompts.add(instance.publicItem.prompt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const modal = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0];
    return [family.id, { prompts, modal }] as const;
  }));
  const rates = LIVE_BANK.map(family => {
    const dump = dumps.get(family.id)!;
    let hits = 0;
    for (let i = 0; i < 200; i++) {
      const instance = instantiate(family, seed(), 'probe', 1), expected = instance.expectedAnswer;
      if (dump.prompts.has(instance.publicItem.prompt)) { hits++; continue; }
      const answer = expected.kind === 'options'
        ? { option_ids: instance.publicItem.options!.filter(o => dump.modal.split('\u0000').includes(o.text)).map(o => o.id) }
        : { text: dump.modal };
      if ('option_ids' in answer && !answer.option_ids.length) continue;
      const graded = gradeAnswer(instance.publicItem, expected, answer);
      if (graded.status === 'evaluated' && graded.correct) hits++;
    }
    return { id: family.id, rate: hits / 200 };
  });
  const failures = rates.filter(row => row.id.startsWith('choice-') && row.rate > 0.3);
  assert.deepEqual(failures, []);
  const mean = rates.reduce((total, row) => total + row.rate, 0) / rates.length;
  assert.ok(mean <= 0.35);
  t.diagnostic(JSON.stringify({ choice_max: Math.max(...rates.filter(row => row.id.startsWith('choice-')).map(row => row.rate)), bank_mean: mean }));
});
