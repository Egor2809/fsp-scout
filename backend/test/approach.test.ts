import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApproach } from '../src/assessment/approach.ts';
import { PRACTICE_BANK, practiceAnswer } from '../src/assessment/practice-bank.ts';
import { gradeAnswer } from '../src/assessment/grading.ts';
test('approach asks about the submitted program and keeps probe answer private', () => {
  for (const family of PRACTICE_BANK) for (let seed = 0; seed < 100; seed++) {
    const input = { familyId: family.id, parameter: 3, code: 'candidate program', language: 'python' as const, seed, id: 'question', index: 20 };
    const q = buildApproach(input);
    assert.deepEqual(q, buildApproach(input));
    assert.equal(q.publicItem.block, 'approach');
    assert.equal(q.publicItem.type, 'short_answer');
    assert.equal(q.publicItem.code.source, input.code);
    assert.equal(Object.hasOwn(q.publicItem, 'expectedAnswer'), false);
    assert.equal(q.publicItem.public_tests, null);
    assert.ok(q.publicItem.prompt.includes(q.probe.input));
    const value = practiceAnswer(family.kind, JSON.parse(q.probe.input), 3);
    assert.equal(q.probe.expected, String(value));
    assert.deepEqual(gradeAnswer(q.publicItem, q.expectedAnswer, { text: String(value) }), { status: 'evaluated', correct: true });
    assert.deepEqual(gradeAnswer(q.publicItem, q.expectedAnswer, { text: String(value + 1) }), { status: 'evaluated', correct: false });
  }
});
