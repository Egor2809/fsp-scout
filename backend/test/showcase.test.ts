import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAMILIES, buildFamily } from '../src/assessment/showcase.ts';
test('showcase has reproducible, diverse instances and no fictional calibration observations', () => {
  for (const f of FAMILIES) {
    const family = buildFamily(f);
    assert.equal(family.calibration_n, 0);
    assert.equal(family.exposure_rate, 0);
    assert.equal(family.instances.length, 3);
    assert.deepEqual(f.render(1729), f.render(1729));
    assert.ok(new Set(Array.from({ length: 100 }, (_, seed) => JSON.stringify(f.render(seed)))).size > 90);
  }
});
test('Go output follows allocation boundary and Python output follows actual persistent call values', () => {
  for (let seed = 0; seed < 200; seed++) {
    const go = FAMILIES.find(f => f.id === 'go-slice-append')!.render(seed);
    const p = go.params as { len: number; cap: number; w: number };
    assert.equal(go.correct_answer, `${p.cap >= p.len + 1 ? p.w : 0} ${p.len}`);
    const py = FAMILIES.find(f => f.id === 'py-mutable-default')!.render(seed);
    const data = py.params as { k: number; values: number[]; expr: string };
    const accumulation: number[] = [];
    for (const value of data.values) accumulation.push(value);
    assert.equal(accumulation.length, data.k + 1);
    assert.equal(py.correct_answer, String(data.expr === 'len' ? accumulation.length : accumulation[0]));
  }
});
test('SQL correct option moves with shuffling and has the right partition and limit', () => {
  const letters = new Set<string>();
  for (let seed = 0; seed < 100; seed++) {
    const instance = FAMILIES.find(f => f.id === 'sql-window-top-n')!.render(seed);
    const letter = instance.correct_answer.split(' ').at(-1)!.toLowerCase();
    letters.add(letter);
    const selected = instance.options!.find(o => o.id === letter)!;
    assert.ok(selected.text.includes(`PARTITION BY ${instance.params.group}`));
    assert.ok(selected.text.includes(`WHERE rn <= ${instance.params.n}`));
  }
  assert.equal(letters.size, 4);
});
