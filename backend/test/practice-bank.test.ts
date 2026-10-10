import test from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICE_BANK, instantiatePractice, practiceAnswer, selectPracticeFamily } from '../src/assessment/practice-bank.ts';

function reference(kind: string, data: number[] | number[][], p: number): number {
  if (kind === 'window') {
    const nums = data as number[];
    return nums.length < p ? 0 : Math.max(...nums.slice(0, nums.length - p + 1).map((_, i) => nums.slice(i, i + p).reduce((a, b) => a + b, 0)));
  }
  if (kind === 'last_write') {
    const pairs = data as number[][];
    return pairs.filter(([key], i) => !pairs.slice(i + 1).some(([k]) => k === key)).reduce((sum, [, value]) => sum + value, 0);
  }
  if (kind === 'streak') {
    const nums = data as number[];
    return Math.max(0, ...nums.map((_, start) => { let length = 0; while (start + length < nums.length && nums[start + length] === p) length++; return length; }));
  }
  const intervals = data as number[][];
  const counts = Array.from({ length: 60 }, (_, i) => intervals.filter(([start, end]) => start <= i - 20 && i - 20 < end).length);
  return kind === 'union' ? counts.filter(n => n > 0).length : Math.max(0, ...counts);
}
test('practice variants keep hidden cases private and agree with independent enumeration', () => {
  for (const family of PRACTICE_BANK) for (let seed = 0; seed < 100; seed++) {
    const instance = instantiatePractice(family, seed, 'instance', 4, 'python');
    assert.deepEqual(instance, instantiatePractice(family, seed, 'instance', 4, 'python'));
    assert.equal(Object.hasOwn(instance.publicItem, 'expectedAnswer'), false);
    assert.equal(Object.hasOwn(instance.publicItem, 'parameters'), false);
    assert.equal(instance.publicItem.public_tests.length, 2);
    assert.equal(instance.expectedAnswer.tests.length, 9);
    for (const c of [...instance.publicItem.public_tests, ...instance.expectedAnswer.tests]) {
      const data = JSON.parse(c.input);
      assert.equal(Number(c.expected), reference(family.kind, data, instance.parameters.parameter), `${family.id}/${seed}/${c.name}`);
    }
  }
});
test('practice handles negative windows, replacements, touching/empty intervals and streak breaks', () => {
  assert.equal(practiceAnswer('window', [-4, -1, -3], 2), -4);
  assert.equal(practiceAnswer('last_write', [[1, 4], [2, 3], [1, -1]], 0), 2);
  assert.equal(practiceAnswer('union', [[0, 3], [3, 5], [2, 4], [9, 9]], 0), 5);
  assert.equal(practiceAnswer('peak', [[0, 3], [3, 5], [2, 4], [9, 9]], 0), 2);
  assert.equal(practiceAnswer('streak', [2, 2, 1, 2, 2, 2], 2), 3);
});
test('practice selection uses real exposure capacity, avoids repeats and balances least-used families', () => {
  assert.equal(selectPracticeFamily(PRACTICE_BANK, [], 1, new Map(), 0.2, () => 0), null);
  const used = new Map(PRACTICE_BANK.map(f => [f.id, 1]));
  assert.equal(selectPracticeFamily(PRACTICE_BANK, [], 5, used, 0.2, () => 0), null);
  used.set(PRACTICE_BANK[2].id, 0);
  assert.equal(selectPracticeFamily(PRACTICE_BANK, [], 10, used, 0.2, () => 0)?.id, PRACTICE_BANK[2].id);
  assert.notEqual(selectPracticeFamily(PRACTICE_BANK, [PRACTICE_BANK[2].id], 10, used, 0.2, () => 0)?.id, PRACTICE_BANK[2].id);
  assert.throws(() => selectPracticeFamily(PRACTICE_BANK, [], 10, used, 0.2, () => 1));
});
