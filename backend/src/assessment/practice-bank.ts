import type { CodeLanguage, Specialization, TestItem } from '../contract/model/index.js';
import { seededRandom } from '../common/cat.ts';
import { exposure } from './session-state.ts';

export interface PracticeCase { name: string; input: string; expected: string }
export interface PracticeFamily { id: string; title: string; competency: string; specializations: readonly Specialization[]; kind: 'window' | 'last_write' | 'union' | 'streak' | 'peak' }
export const PRACTICE_BANK_VERSION = 'practice-20261010-v1';
const coding: readonly Specialization[] = ['backend', 'frontend', 'mobile'];
export const PRACTICE_BANK: readonly PracticeFamily[] = [
  { id: 'practice-window', title: 'Максимальная сумма окна', competency: 'algorithms', specializations: coding, kind: 'window' },
  { id: 'practice-last-write', title: 'Последняя запись по ключу', competency: 'algorithms', specializations: coding, kind: 'last_write' },
  { id: 'practice-union', title: 'Суммарная занятость', competency: 'algorithms', specializations: coding, kind: 'union' },
  { id: 'practice-streak', title: 'Непрерывная серия', competency: 'algorithms', specializations: coding, kind: 'streak' },
  { id: 'practice-peak', title: 'Пиковая параллельность', competency: 'algorithms', specializations: coding, kind: 'peak' },
];
export function selectPracticeFamily(bank: readonly PracticeFamily[], served: readonly string[], sessionCount: number,
  usages: ReadonlyMap<string, number>, maxExposure: number, random: () => number): PracticeFamily | null {
  const eligible = bank.filter(f => !served.includes(f.id) && exposure(sessionCount, usages.get(f.id) ?? 0, maxExposure).canServe);
  if (!eligible.length) return null;
  const leastUsed = Math.min(...eligible.map(f => usages.get(f.id) ?? 0));
  const choices = eligible.filter(f => (usages.get(f.id) ?? 0) === leastUsed).sort((a, b) => a.id.localeCompare(b.id));
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Invalid random draw');
  return choices[Math.floor(draw * choices.length)];
}
const starter: Partial<Record<CodeLanguage, string>> = {
  python: 'import json, sys\ndata = json.loads(sys.stdin.read())\n# Вычислите и напечатайте одно целое число.\n',
  javascript: "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));\n// Вычислите и напечатайте одно целое число.\n",
  go: 'package main\nimport ("encoding/json"; "os")\nfunc main() {\n  var data interface{}\n  json.NewDecoder(os.Stdin).Decode(&data)\n  // Вычислите и напечатайте одно целое число.\n}\n',
};

/** Independent server oracle; candidate programs receive the stdin JSON only. */
export function practiceAnswer(kind: PracticeFamily['kind'], value: number[] | number[][], parameter: number): number {
  if (kind === 'window') {
    const values = value as number[];
    if (values.length < parameter) return 0;
    let sum = values.slice(0, parameter).reduce((a, b) => a + b, 0), maximum = sum;
    for (let i = parameter; i < values.length; i++) { sum += values[i] - values[i - parameter]; maximum = Math.max(maximum, sum); }
    return maximum;
  }
  if (kind === 'last_write') {
    const latest = new Map<number, number>();
    for (const [key, val] of value as number[][]) latest.set(key, val);
    return [...latest.values()].reduce((a, b) => a + b, 0);
  }
  if (kind === 'streak') {
    let current = 0, maximum = 0;
    for (const val of value as number[]) { current = val === parameter ? current + 1 : 0; maximum = Math.max(maximum, current); }
    return maximum;
  }
  const intervals = (value as number[][]).filter(([start, end]) => start < end);
  if (kind === 'peak') {
    const events = intervals.flatMap(([start, end]) => [[start, 1], [end, -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let active = 0, maximum = 0;
    for (const [, delta] of events) { active += delta; maximum = Math.max(maximum, active); }
    return maximum;
  }
  const ordered = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let total = 0, end = -Infinity;
  for (const [start, nextEnd] of ordered) { total += Math.max(0, nextEnd - Math.max(start, end)); end = Math.max(end, nextEnd); }
  return total;
}

export function instantiatePractice(family: PracticeFamily, seed: number, id: string, index: number, language: CodeLanguage) {
  if (!PRACTICE_BANK.some(f => f.id === family.id && f.kind === family.kind) || !Number.isInteger(seed) || !Number.isInteger(index) || index < 1 || !starter[language]) throw new RangeError('Invalid practice instance');
  const random = seededRandom(seed), draw = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const parameter = family.kind === 'window' ? draw(2, 6) : draw(1, 4);
  const interval = () => { const start = draw(-10, 15); return [start, start + draw(0, 12)]; };
  const values = (n: number): number[] | number[][] => family.kind === 'window' ? Array.from({ length: n }, () => draw(-20, 20))
    : family.kind === 'streak' ? Array.from({ length: n }, () => draw(1, 4))
    : family.kind === 'last_write' ? Array.from({ length: n }, () => [draw(1, 5), draw(-20, 20)])
    : Array.from({ length: n }, interval);
  const description = family.kind === 'window' ? `Дан JSON-массив целых чисел. Напечатайте максимальную сумму ровно ${parameter} соседних элементов. Если элементов меньше ${parameter}, напечатайте 0. Сумма может быть отрицательной.`
    : family.kind === 'last_write' ? 'Дан JSON-массив пар [key,value] в хронологическом порядке. Для каждого целочисленного ключа оставьте только последнее значение. Напечатайте сумму оставшихся значений.'
    : family.kind === 'streak' ? `Дан JSON-массив целых чисел. Напечатайте максимальное число подряд идущих элементов, равных ${parameter}.`
    : family.kind === 'union' ? 'Дан JSON-массив интервалов [start,end), start <= end. Напечатайте длину объединения интервалов. Пересечения считаются один раз, пустой интервал имеет длину 0.'
    : 'Дан JSON-массив интервалов [start,end), start <= end. Напечатайте максимальное число одновременно активных непустых интервалов. При совпадении времени завершение происходит перед началом.';
  const make = (name: string, data: number[] | number[][]): PracticeCase => ({ name, input: JSON.stringify(data), expected: String(practiceAnswer(family.kind, data, parameter)) });
  const publicTests = [make('Пустой вход', []), make('Пример', values(8))];
  const boundary: number[] | number[][] = family.kind === 'window' ? Array(2 * parameter).fill(-3)
    : family.kind === 'streak' ? [parameter, parameter, parameter + 1, parameter, parameter]
    : family.kind === 'last_write' ? [[1, 8], [1, -4], [2, 3], [1, 0]]
    : [[0, 4], [4, 8], [2, 6], [3, 3], [-2, 0]];
  const hiddenTests = [make('Граница', boundary), make('Короткий вход', values(1)), ...Array.from({ length: 5 }, (_, i) => make(`Вариант ${i + 1}`, values(draw(10, 40))))];
  const publicItem: TestItem = { instance_id: id, index, block: 'practice', type: 'code', competency: { id: family.competency, name: 'Алгоритмы и обработка данных' },
    difficulty_level: 3, title: family.title, prompt: `${description}\n\nВход: один JSON-массив из stdin, не более 100000 элементов, значения целые от -1000000 до 1000000. Выход: одно целое число. Для пустого входа ответ 0.`,
    code: null, options: null, answer_language: language, starter_code: starter[language]!, max_length: null, public_tests: publicTests };
  return { familyId: family.id, templateVersion: 1, parameters: { seed, parameter }, publicItem,
    expectedAnswer: { kind: 'sandbox' as const, tests: [...publicTests, ...hiddenTests] }, discrimination: 1.2, difficulty: 0 };
}
