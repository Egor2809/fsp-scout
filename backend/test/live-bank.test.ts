import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { LIVE_BANK, LIVE_BANK_VERSION, instantiate, bankInventory, requiredCompetencies } from '../src/assessment/live-bank.ts';
import { gradeAnswer } from '../src/assessment/grading.ts';
import { FAMILIES } from '../src/assessment/showcase.ts';
import { choicePools } from '../src/assessment/choice-pools.ts';

test('every choice pool contains four different questions and four different answer sets before substitution', () => {
  for (const pools of Object.values(choicePools)) for (const scenarios of Object.values(pools)) {
    assert.equal(scenarios.length, 4);
    assert.equal(new Set(scenarios.map(([prompt]) => prompt)).size, 4);
    assert.equal(new Set(scenarios.map(([, correct]) => (typeof correct === 'string' ? [correct] : [...correct]).sort().join('\u0000'))).size, 4);
  }
});

test('choice families cover every specialization and validate 200 deterministic shuffled instances', () => {
  assert.equal(LIVE_BANK_VERSION, 'expert-bank-20261010-v5');
  const choices = LIVE_BANK.filter(f => f.generate(0).options);
  for (const spec of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    const families = choices.filter(f => f.specializations.includes(spec));
    assert.ok(families.length >= 10, spec);
    assert.equal(Math.min(...families.map(f => f.b)), -1.8);
    assert.equal(Math.max(...families.map(f => f.b)), 1.8);
    assert.ok(families.some(f => instantiate(f, 0, 'item', 1).publicItem.type === 'multiple_choice'));
  }
  for (const family of choices) {
    const variants = new Set<string>(), positions = new Set<string>(), keys = new Set<string>(), scenarios = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const instance = instantiate(family, seed, 'item', 1), item = instance.publicItem, expected = instance.expectedAnswer;
      assert.equal(expected.kind, 'options');
      if (expected.kind !== 'options') throw new Error('Expected options');
      assert.deepEqual(instance, instantiate(family, seed, 'item', 1));
      const options = item.options!;
      keys.add(options.filter(o => expected.ids.includes(o.id)).map(o => o.text).sort().join('\u0000'));
      scenarios.add(instance.parameters.scenario!);
      assert.equal(new Set(options.map(o => o.id)).size, options.length);
      assert.equal(new Set(options.map(o => o.text)).size, options.length);
      assert.ok(!/\{n(?:[+-]1)?\}/.test(JSON.stringify(item)), `${family.id}: unresolved parameter`);
      assert.ok(expected.ids.every(id => options.some(o => o.id === id)));
      assert.ok(!JSON.stringify(item).includes('private-'));
      assert.ok(!('correctIds' in item) && !('expectedAnswer' in item));
      assert.deepEqual(gradeAnswer(item, expected, { option_ids: [...expected.ids].reverse() }), { status: 'evaluated', correct: true });
      for (const wrong of options.filter(o => !expected.ids.includes(o.id))) {
        assert.deepEqual(gradeAnswer(item, expected, { option_ids: [wrong.id] }), { status: 'evaluated', correct: false });
      }
      if (item.type === 'multiple_choice') {
        assert.ok(expected.ids.length > 1);
        assert.deepEqual(gradeAnswer(item, expected, { option_ids: expected.ids.slice(1) }), { status: 'evaluated', correct: false });
        assert.deepEqual(gradeAnswer(item, expected, { option_ids: options.map(o => o.id) }), { status: 'evaluated', correct: false });
      } else assert.equal(expected.ids.length, 1);
      assert.throws(() => gradeAnswer(item, expected, { option_ids: ['unknown'] }));
      positions.add(expected.ids.join(','));
      variants.add(item.prompt);
    }
    assert.ok(variants.size >= 5, family.id);
    assert.ok(keys.size >= 4, `${family.id}: only ${keys.size} correct texts`);
    assert.equal(scenarios.size, 5, `${family.id}: missing scenario`);
    assert.ok(positions.size > 1, `${family.id}: fixed answer position`);
  }
});
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
      if (instance.expectedAnswer.kind === 'numeric') {
        const answer = instance.expectedAnswer.value;
        assert.deepEqual(gradeAnswer(instance.publicItem, instance.expectedAnswer, { text: String(answer) }), { status: 'evaluated', correct: true });
        assert.deepEqual(gradeAnswer(instance.publicItem, instance.expectedAnswer, { text: String(answer + 1) }), { status: 'evaluated', correct: false });
      } else if (instance.expectedAnswer.kind === 'options') {
        assert.deepEqual(gradeAnswer(instance.publicItem, instance.expectedAnswer, { option_ids: instance.expectedAnswer.ids }), { status: 'evaluated', correct: true });
      }
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
test('every live family yields finite, deterministic and varied variants', () => {
  for (const family of LIVE_BANK) {
    const prompts = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const variant = family.generate(seed);
      if (!variant.options) assert.ok(Number.isFinite(variant.value), `${family.id} seed ${seed}`);
      assert.ok(!/undefined|NaN/.test(variant.prompt), `${family.id} seed ${seed}`);
      assert.ok(Object.values(variant.parameters).every(Number.isFinite), `${family.id} seed ${seed}`);
      assert.ok(variant.tolerance === undefined || (variant.tolerance >= 0 && variant.tolerance < 1), family.id);
      assert.deepEqual(family.generate(seed), variant);
      prompts.add(variant.prompt);
    }
    assert.ok(prompts.size >= 5, family.id);
  }
});
test('each specialization has at least 34 families over 3+ competencies and the full difficulty range', () => {
  const skills = new Set((JSON.parse(readFileSync(new URL('../src/taxonomy/data.json', import.meta.url), 'utf8')) as { skills: { id: string }[] }).skills.map(s => s.id));
  for (const family of LIVE_BANK) {
    assert.ok(family.b >= -1.8 && family.b <= 1.8, family.id);
    for (const skill of family.skillIds) assert.ok(skills.has(skill), `${family.id}: ${skill}`);
  }
  for (const specialization of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    const families = LIVE_BANK.filter(f => f.specializations.includes(specialization));
    assert.ok(families.length >= 34, specialization);
    assert.ok(new Set(families.map(f => f.competency)).size >= 3, specialization);
    assert.ok(families.filter(f => f.b <= -0.6).length >= 8, specialization);
    assert.ok(families.filter(f => f.b > -0.6 && f.b <= 0.6).length >= 8, specialization);
    assert.ok(families.filter(f => f.b > 0.6).length >= 7, specialization);
  }
});
test('selected keys agree with brute-force references', () => {
  const byId = (id: string) => LIVE_BANK.find(f => f.id === id)!;
  for (let seed = 0; seed < 50; seed++) {
    const rehash = byId('live-rehash-moves').generate(seed), { shards, keys } = rehash.parameters;
    let moved = 0;
    for (let k = 0; k < keys!; k++) if (k % shards! !== k % (shards! + 1)) moved++;
    assert.equal(rehash.value, moved);
    const throttle = byId('live-throttle-calls').generate(seed), { step, window, count } = throttle.parameters;
    let fired = 0, last = -Infinity;
    for (let i = 0; i < count!; i++) if (i * step! - last >= window!) { fired++; last = i * step!; }
    assert.equal(throttle.value, fired);
    const pairwise = byId('live-pairwise-min').generate(seed), [a, b, c] = [pairwise.parameters.x!, pairwise.parameters.y!, pairwise.parameters.z!].sort((p, q) => q - p);
    const rows: number[][] = [];
    for (let i = 0; i < a!; i++) for (let j = 0; j < b!; j++) rows.push([i, j, (i + j) % c!]);
    const covered = (p: number, q: number, size: number) => new Set(rows.map(r => `${r[p]}:${r[q]}`)).size === size;
    assert.ok(covered(0, 1, a! * b!) && covered(0, 2, a! * c!) && covered(1, 2, b! * c!));
    assert.equal(pairwise.value, rows.length);
    const binary = byId('live-binary-search-probes').generate(seed);
    let lo = 0, hi = binary.parameters.size! - 1, probes = 0;
    while (lo <= hi) { const mid = (lo + hi) >> 1; probes++; lo = mid + 1; }
    assert.equal(binary.value, probes);
  }
});

test('mandatory coverage only for competencies the exposure ceiling can sustain', () => {
  for (const specialization of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    const bank = LIVE_BANK.filter(f => f.specializations.includes(specialization));
    const required = requiredCompetencies(bank, 0.4);
    assert.ok(required.length > 0);
    for (const id of required) assert.ok(bank.filter(f => f.competency === id).length >= 3);
  }
});
test('complete tree bottom level matches level-order filling', () => {
  for (let seed = 0; seed < 50; seed++) {
    const tree = LIVE_BANK.find(f => f.id === 'live-binary-tree-height')!.generate(seed), nodes = tree.parameters.nodes!;
    let left = nodes, width = 1;
    while (left > width) { left -= width; width *= 2; }
    assert.equal(tree.value, left);
  }
});
