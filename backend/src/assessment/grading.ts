import type { Answer, TestItem } from '../contract/model/index.js';

export type ExpectedAnswer =
  | { kind: 'options'; ids: string[] }
  | { kind: 'text'; value: string; caseSensitive: boolean }
  | { kind: 'numeric'; value: number; absoluteTolerance: number; relativeTolerance: number }
  | { kind: 'sandbox'; tests?: { name: string; input: string; expected: string }[] }
  | { kind: 'human_review' };
export type GradeAnswer = { status: 'evaluated'; correct: boolean } | { status: 'pending'; reason: 'sandbox' | 'human_review' };
export class InvalidAnswer extends Error {
  readonly pointer: string;
  constructor(pointer: string, message: string) { super(message); this.pointer = pointer; }
}
function fail(field: string, message: string): never { throw new InvalidAnswer(`/answer/${field}`, message); }
function normalize(value: string, sensitive: boolean): string {
  const text = value.normalize('NFKC').trim().replace(/\s+/gu, ' ');
  return sensitive ? text : text.toLocaleLowerCase('en-US');
}

/** Server-side answer checking. This function never executes candidate text or code. */
export function gradeAnswer(item: Pick<TestItem, 'type' | 'options' | 'max_length' | 'answer_language'>, expected: ExpectedAnswer, answer: Answer): GradeAnswer {
  const fields = Object.keys(answer).filter(k => k !== 'skipped');
  if (answer.skipped === true) {
    if (fields.length) fail('skipped', 'A skipped answer cannot contain another response');
    return { status: 'evaluated', correct: false };
  }
  if (item.type === 'single_choice' || item.type === 'multiple_choice') {
    if (fields.some(k => k !== 'option_ids')) fail('option_ids', 'Only option_ids is permitted');
    if (!answer.option_ids?.length) fail('option_ids', 'Choose an option');
    const ids = answer.option_ids;
    if (new Set(ids).size !== ids.length) fail('option_ids', 'Duplicate option IDs');
    if (item.type === 'single_choice' && ids.length !== 1) fail('option_ids', 'Choose exactly one option');
    if (ids.some(id => !item.options?.some(o => o.id === id))) fail('option_ids', 'Unknown option ID');
    if (expected.kind !== 'options') throw new Error('Invalid server-side answer key');
    if (!expected.ids.length || new Set(expected.ids).size !== expected.ids.length || (item.type === 'single_choice' && expected.ids.length !== 1)
      || expected.ids.some(id => !item.options?.some(o => o.id === id))) throw new Error('Invalid server-side option key');
    return { status: 'evaluated', correct: ids.length === expected.ids.length && ids.every(id => expected.ids.includes(id)) };
  }
  if (item.type === 'code') {
    if (fields.some(k => !['code', 'language'].includes(k))) fail('code', 'Only code and language are permitted');
    if (!answer.code?.trim() || answer.code.length > 20000) fail('code', 'Code is empty or too long');
    if (!answer.language || answer.language !== item.answer_language) fail('language', 'Language does not match the item');
    if (expected.kind !== 'sandbox') throw new Error('Invalid server-side code policy');
    return { status: 'pending', reason: 'sandbox' };
  }
  if (fields.some(k => k !== 'text')) fail('text', 'Only text is permitted');
  if (!answer.text?.trim() || answer.text.length > (item.max_length ?? 4000)) fail('text', 'Text is empty or too long');
  if (item.type === 'open_text') {
    if (expected.kind !== 'human_review') throw new Error('Open text needs an explicit review policy');
    return { status: 'pending', reason: 'human_review' };
  }
  if (expected.kind === 'text') return { status: 'evaluated', correct: normalize(answer.text, expected.caseSensitive) === normalize(expected.value, expected.caseSensitive) };
  if (expected.kind !== 'numeric') throw new Error('Invalid server-side short answer key');
  if (![expected.value, expected.absoluteTolerance, expected.relativeTolerance].every(Number.isFinite) || expected.absoluteTolerance < 0 || expected.relativeTolerance < 0) throw new Error('Invalid numeric tolerance');
  const text = answer.text.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) fail('text', 'A finite numeric answer is required');
  const value = Number(text);
  if (!Number.isFinite(value)) fail('text', 'A finite numeric answer is required');
  const tolerance = Math.max(expected.absoluteTolerance, expected.relativeTolerance * Math.abs(expected.value));
  if (!Number.isFinite(tolerance)) throw new Error('Numeric tolerance overflow');
  return { status: 'evaluated', correct: Math.abs(value - expected.value) <= tolerance };
}
