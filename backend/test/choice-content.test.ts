import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { LIVE_BANK, instantiate } from '../src/assessment/live-bank.ts';

const family = (id: string) => LIVE_BANK.find(row => row.id === `choice-${id}`)!;
const correctTexts = (instance: ReturnType<typeof instantiate>) => {
  const expected = instance.expectedAnswer;
  assert.equal(expected.kind, 'options');
  if (expected.kind !== 'options') throw new Error('Expected choice');
  return instance.publicItem.options!.filter(option => expected.ids.includes(option.id)).map(option => option.text);
};

test('index answers match the actual equality predicate and sort columns for every scenario', () => {
  for (let seed = 0; seed < 200; seed++) {
    const instance = instantiate(family('backend-index'), seed, 'item', 1);
    const match = instance.publicItem.prompt.match(/WHERE (\w+)\s*=\s*\? ORDER BY (\w+) (ASC|DESC)/);
    assert.ok(match);
    const [answer] = correctTexts(instance);
    assert.equal(answer.replace(/ ASC/g, ''), `(${match[1]}, ${match[2]} ${match[3]})`.replace(/ ASC/g, ''));
  }
});

test('boundary answer sets contain both endpoints and their nearest cross-boundary neighbours', () => {
  for (let seed = 0; seed < 200; seed++) {
    const instance = instantiate(family('qa-boundary'), seed, 'item', 1);
    if (instance.parameters.scenario === 0) continue;
    const prompt = instance.publicItem.prompt, match = prompt.match(/0 (<=|<) x (<=|<) n, n=(\d+)/);
    assert.ok(match);
    const lower = match[1] === '<=' ? 0 : 1, upper = Number(match[3]) - (match[2] === '<=' ? 0 : 1);
    assert.deepEqual(correctTexts(instance)[0]!.split(', ').map(Number), [lower - 1, lower, upper, upper + 1]);
  }
});

test('event-loop answer keys agree with execution of the displayed program', async () => {
  const covered = new Set<number>();
  for (let seed = 0; seed < 200; seed++) {
    const instance = instantiate(family('frontend-event-loop'), seed, 'item', 1), scenario = instance.parameters.scenario!;
    if (scenario === 0 || covered.has(scenario)) continue;
    covered.add(scenario);
    const match = instance.publicItem.prompt.match(/^В браузере выполняется: (.+) Каков порядок вывода\?$/);
    assert.ok(match);
    const values: unknown[] = [];
    runInNewContext(match[1]!, { log: (value: unknown) => values.push(value), queueMicrotask, setTimeout }, { timeout: 100 });
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.deepEqual(correctTexts(instance), [values.join(', ')]);
  }
  assert.equal(covered.size, 4);
});

test('closure increment answers depend on the displayed value rather than a fixed answer phrase', () => {
  let checked = 0;
  for (let seed = 0; seed < 200; seed++) {
    const instance = instantiate(family('frontend-closure'), seed, 'item', 1);
    if (instance.parameters.scenario !== 2) continue;
    const match = instance.publicItem.prompt.match(/let x=(\d+); const f=\(\)=>x; x\+\+; log\(f\(\)\)/);
    assert.ok(match);
    let actual: unknown;
    runInNewContext(match[0], { log: (value: unknown) => { actual = value; } }, { timeout: 100 });
    assert.deepEqual(correctTexts(instance), [String(actual)]);
    checked++;
  }
  assert.ok(checked > 0);
});
