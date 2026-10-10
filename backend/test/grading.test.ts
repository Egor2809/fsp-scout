import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeAnswer, InvalidAnswer } from '../src/assessment/grading.ts';
import type { TestItem } from '../src/contract/model/index.js';
const choice: Pick<TestItem, 'type' | 'options' | 'max_length' | 'answer_language'> = { type: 'single_choice', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }], max_length: null, answer_language: null };
const text = { ...choice, type: 'short_answer' as const, options: null, max_length: 20 };
test('choice grading checks the full set, not substring or order, and rejects malformed payloads', () => {
  const key = { kind: 'options' as const, ids: ['a'] };
  assert.deepEqual(gradeAnswer(choice, key, { option_ids: ['a'] }), { status: 'evaluated', correct: true });
  assert.deepEqual(gradeAnswer(choice, key, { option_ids: ['b'] }), { status: 'evaluated', correct: false });
  for (const answer of [{ option_ids: ['a', 'a'] }, { option_ids: ['missing'] }, { option_ids: ['a'], text: 'a' }, {}, { skipped: true, option_ids: ['a'] }]) assert.throws(() => gradeAnswer(choice, key, answer), InvalidAnswer);
  const multiple = { ...choice, type: 'multiple_choice' as const }, all = { kind: 'options' as const, ids: ['a', 'c'] };
  assert.deepEqual(gradeAnswer(multiple, all, { option_ids: ['c', 'a'] }), { status: 'evaluated', correct: true });
  assert.deepEqual(gradeAnswer(multiple, all, { option_ids: ['a'] }), { status: 'evaluated', correct: false });
  assert.deepEqual(gradeAnswer(choice, key, { skipped: true }), { status: 'evaluated', correct: false });
});
test('numeric answers use explicit tolerances, support decimal comma and reject executable/nonfinite text', () => {
  const key = { kind: 'numeric' as const, value: 100, absoluteTolerance: 1, relativeTolerance: 0 };
  assert.deepEqual(gradeAnswer(text, key, { text: '99' }), { status: 'evaluated', correct: true });
  assert.deepEqual(gradeAnswer(text, key, { text: '101' }), { status: 'evaluated', correct: true });
  assert.deepEqual(gradeAnswer(text, key, { text: '101,1' }), { status: 'evaluated', correct: false });
  assert.deepEqual(gradeAnswer(text, key, { text: '1e2' }), { status: 'evaluated', correct: true });
  for (const value of ['100+0', 'Infinity', 'NaN', '1e999', '100; process.exit()', '1 00']) assert.throws(() => gradeAnswer(text, key, { text: value }), InvalidAnswer);
  assert.deepEqual(gradeAnswer(text, { ...key, value: 1000, absoluteTolerance: 0, relativeTolerance: 0.01 }, { text: '1010' }), { status: 'evaluated', correct: true });
});
test('short output normalization is explicit and respects length and case', () => {
  const key = { kind: 'text' as const, value: 'AB 10', caseSensitive: true };
  assert.deepEqual(gradeAnswer(text, key, { text: '  AB\n１０  ' }), { status: 'evaluated', correct: true });
  assert.deepEqual(gradeAnswer(text, key, { text: 'ab 10' }), { status: 'evaluated', correct: false });
  assert.throws(() => gradeAnswer(text, key, { text: 'x'.repeat(21) }), InvalidAnswer);
  assert.throws(() => gradeAnswer(text, key, { text: 'AB 10', code: 'AB 10' }), InvalidAnswer);
});
test('code and open text cannot become a confirmed correct answer without their real evaluator', () => {
  const code = { ...choice, type: 'code' as const, options: null, answer_language: 'javascript' as const };
  assert.deepEqual(gradeAnswer(code, { kind: 'sandbox' }, { code: 'return true;', language: 'javascript' }), { status: 'pending', reason: 'sandbox' });
  assert.throws(() => gradeAnswer(code, { kind: 'sandbox' }, { code: 'return true;', language: 'python' }), InvalidAnswer);
  assert.deepEqual(gradeAnswer({ ...text, type: 'open_text' }, { kind: 'human_review' }, { text: 'Approach' }), { status: 'pending', reason: 'human_review' });
  assert.throws(() => gradeAnswer(choice, { kind: 'options', ids: ['missing'] }, { option_ids: ['a'] }), /server-side option key/);
});
