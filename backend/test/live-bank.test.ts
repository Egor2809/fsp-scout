import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { LIVE_BANK, instantiate, bankInventory } from '../src/assessment/live-bank.ts';
import { gradeAnswer } from '../src/assessment/grading.ts';
import { FAMILIES } from '../src/assessment/showcase.ts';
test('live instances have private answer keys, reproducible variants and a complete public projection', () => {
  const publicKeys = ['instance_id', 'index', 'block', 'type', 'competency', 'difficulty_level', 'title', 'prompt', 'code', 'options', 'answer_language', 'starter_code', 'max_length', 'public_tests'].sort();
  assert.equal(new Set(LIVE_BANK.map(f => f.id)).size, LIVE_BANK.length);
  assert.ok(LIVE_BANK.every(f => !FAMILIES.some(s => s.id === f.id)));
  for (const family of LIVE_BANK) {
    assert.equal(family.calibration, 'expert_prior');
    const variants = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const id = randomUUID(), instance = instantiate(family, seed, id, 1);
      assert.deepEqual(instance, instantiate(family, seed, id, 1));
      assert.deepEqual(Object.keys(instance.publicItem).sort(), publicKeys);
      assert.ok(instance.publicItem.difficulty_level >= 1 && instance.publicItem.difficulty_level <= 5);
      const answer = family.generate(seed).value;
      assert.deepEqual(gradeAnswer(instance.publicItem, instance.expectedAnswer, { text: String(answer) }), { status: 'evaluated', correct: true });
      assert.deepEqual(gradeAnswer(instance.publicItem, instance.expectedAnswer, { text: String(answer + 1) }), { status: 'evaluated', correct: false });
      variants.add(instance.publicItem.prompt);
    }
    assert.ok(variants.size >= 10, family.id);
  }
});
test('SQL join and nested-loop counts agree with enumerated reference cases', () => {
  for (let seed = 0; seed < 50; seed++) {
    const join = LIVE_BANK.find(f => f.id === 'live-sql-join-multiplicity')!.generate(seed), { a, b, c, d } = join.parameters;
    const left = [...Array(a).fill(1), ...Array(c).fill(2)], right = [...Array(b).fill(1), ...Array(d).fill(2)];
    const result = left.flatMap(l => right.filter(r => l === r));
    assert.equal(join.value, result.length);
    const loop = LIVE_BANK.find(f => f.id === 'live-loop-pairs')!.generate(seed);
    let calls = 0;
    for (let i = 0; i < loop.parameters.size!; i++) for (let j = 0; j < i; j++) calls++;
    assert.equal(loop.value, calls);
  }
});
test('queue drain and token bucket answers agree with step-by-step simulation', () => {
  for (let seed = 0; seed < 50; seed++) {
    const queue = LIVE_BANK.find(f => f.id === 'live-queue-drain')!.generate(seed), p = queue.parameters;
    let backlog = p.backlog!, elapsed = 0;
    while (backlog > 0) { backlog += p.input!; backlog -= Math.min(backlog, p.output!); elapsed++; }
    assert.equal(queue.value, elapsed);
    const bucket = LIVE_BANK.find(f => f.id === 'live-token-bucket')!.generate(seed), t = bucket.parameters;
    let tokens = t.tokens!;
    for (let i = 0; i < t.seconds!; i++) tokens = Math.min(t.capacity!, tokens + t.rate!);
    let accepted = 0;
    for (let i = 0; i < t.requests!; i++) if (tokens > 0) { tokens--; accepted++; }
    assert.equal(bucket.value, accepted);
  }
});
test('inventory audit exposes the real bank deficit rather than relaxing the exposure limit', () => {
  for (const specialization of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    const audit = bankInventory(specialization, 18, 0.2);
    assert.equal(audit.required, 90);
    assert.equal(audit.sufficientInventory, false);
    assert.equal(audit.deficit, 90 - audit.available);
  }
});
