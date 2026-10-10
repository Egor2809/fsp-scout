import type { CodeLanguage, TestItem } from '../contract/model/index.js';
import { seededRandom } from '../common/cat.ts';
import { PRACTICE_BANK, practiceAnswer } from './practice-bank.ts';

/** The probe is executed with the submitted code before this question can be committed. */
export function buildApproach(input: { familyId: string; parameter: number; code: string; language: CodeLanguage;
  seed: number; id: string; index: number }) {
  const family = PRACTICE_BANK.find(f => f.id === input.familyId);
  if (!family || !Number.isInteger(input.parameter) || input.parameter < 1 || !input.code.trim()
    || !Number.isInteger(input.seed) || !Number.isInteger(input.index) || input.index < 1) throw new RangeError('Invalid approach source');
  const random = seededRandom(input.seed), draw = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const data = family.kind === 'window' ? Array.from({ length: input.parameter + 3 }, () => draw(-9, 9))
    : family.kind === 'streak' ? Array.from({ length: 9 }, () => draw(1, 4))
    : family.kind === 'last_write' ? Array.from({ length: 7 }, () => [draw(1, 3), draw(-9, 9)])
    : Array.from({ length: 6 }, () => { const start = draw(-3, 8); return [start, start + draw(0, 6)]; });
  const value = practiceAnswer(family.kind, data, input.parameter);
  const probe = { name: 'Проверка уточняющего входа', input: JSON.stringify(data), expected: String(value) };
  const publicItem: TestItem = { instance_id: input.id, index: input.index, block: 'approach', type: 'short_answer',
    competency: { id: family.competency, name: 'Понимание собственного решения' }, difficulty_level: 3,
    title: 'Проверьте ход собственного решения', prompt: `Ниже ваш принятый код. Не запуская его повторно, определите, какое целое число он выведет для входа:\n\n${probe.input}\n\nУкажите только число.`,
    code: { language: input.language, source: input.code }, options: null, answer_language: null, starter_code: null, max_length: 100, public_tests: null };
  return { familyId: `approach-${family.id}`, templateVersion: 1, publicItem, probe,
    parameters: { seed: input.seed, practice_parameter: input.parameter }, expectedAnswer: { kind: 'numeric' as const, value, absoluteTolerance: 0, relativeTolerance: 0 },
    discrimination: 1.2, difficulty: 0 };
}
