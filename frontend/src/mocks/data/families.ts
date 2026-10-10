import type { ItemFamily, ItemInstancePreview, Specialization } from '@/api/generated/model'
import { mulberry32 } from '@/lib/irt'

/**
 * Витринные семейства заданий (экран «Как работает тест»). Экземпляры строятся из параметров,
 * правильный ответ вычисляется из них же — выученный ответ одного экземпляра не подходит к другому.
 */
interface FamilyDefinition {
  id: string
  title: string
  specialization: Specialization
  competency: string
  type: ItemFamily['type']
  a: number
  b: number
  description: string
  template: string
  params: ItemFamily['params']
  exposureRate: number
  calibrationN: number
  render: (seed: number) => ItemInstancePreview
}

const pick = <T,>(rnd: () => number, list: readonly T[]): T => list[Math.floor(rnd() * list.length)] as T

const sliceFamily: FamilyDefinition = {
  id: 'go-slice-append',
  title: 'Срезы Go: общий массив после append',
  specialization: 'backend',
  competency: 'Языки и рантайм',
  type: 'short_answer',
  a: 1.42,
  b: 0.35,
  description:
    'Проверяет понимание того, когда append создаёт новый базовый массив. Решение одинаковое для всех экземпляров: сравнить len и cap, а меняются числа и имена.',
  template:
    '{{x}} := make([]int, {{len}}, {{cap}})\n{{y}} := append({{x}}, {{v}})\n{{y}}[0] = {{w}}\nfmt.Println({{x}}[0], len({{x}}))',
  params: [
    { name: 'len', description: 'Длина исходного среза', domain: '1..4' },
    { name: 'cap', description: 'Ёмкость (≥ len)', domain: 'len..len+2' },
    { name: 'v, w', description: 'Добавляемое и записываемое значения', domain: '2..99' },
    { name: 'x, y', description: 'Имена переменных', domain: 'словарь имён' },
  ],
  exposureRate: 0.14,
  calibrationN: 1840,
  render: (seed) => {
    const rnd = mulberry32(seed)
    const len = 1 + Math.floor(rnd() * 4)
    const cap = len + Math.floor(rnd() * 3)
    const v = 2 + Math.floor(rnd() * 97)
    const w = 2 + Math.floor(rnd() * 97)
    const [x, y] = pick(rnd, [
      ['a', 'b'],
      ['ids', 'next'],
      ['buf', 'out'],
      ['src', 'dst'],
    ] as const)
    const shared = cap > len
    const source = `${x} := make([]int, ${len}, ${cap})\n${y} := append(${x}, ${v})\n${y}[0] = ${w}\nfmt.Println(${x}[0], len(${x}))`
    return {
      seed,
      params: { len, cap, v, w, x, y },
      title: 'Что выведет программа?',
      prompt: 'Введите вывод программы (значения через пробел).',
      code: { language: 'go', source },
      options: null,
      correct_answer: `${shared ? w : 0} ${len}`,
    }
  },
}

const mutableDefaultFamily: FamilyDefinition = {
  id: 'py-mutable-default',
  title: 'Python: изменяемый аргумент по умолчанию',
  specialization: 'backend',
  competency: 'Языки и рантайм',
  type: 'short_answer',
  a: 1.18,
  b: -0.55,
  description:
    'Значение по умолчанию вычисляется один раз при определении функции. Экземпляры отличаются числом вызовов, именами и тем, что именно печатается.',
  template: 'def {{fn}}(item, {{acc}}=[]):\n    {{acc}}.append(item)\n    return {{acc}}\n\n{{calls}}\nprint({{expr}})',
  params: [
    { name: 'k', description: 'Сколько раз функция вызвана до печати', domain: '1..4' },
    { name: 'expr', description: 'Что печатаем: длину или последний элемент', domain: 'len | last' },
    { name: 'fn, acc', description: 'Имена функции и аргумента', domain: 'словарь имён' },
  ],
  exposureRate: 0.17,
  calibrationN: 2210,
  render: (seed) => {
    const rnd = mulberry32(seed)
    const k = 1 + Math.floor(rnd() * 4)
    const [fn, acc] = pick(rnd, [
      ['add', 'bucket'],
      ['push', 'stack'],
      ['collect', 'seen'],
      ['remember', 'cache'],
    ] as const)
    const printLen = rnd() < 0.5
    const values = Array.from({ length: k + 1 }, (_, i) => (i + 1) * 10 + Math.floor(rnd() * 9))
    const calls = values
      .slice(0, k)
      .map((v) => `${fn}(${v})`)
      .join('\n')
    const last = values[k] ?? 0
    const expr = printLen ? `len(${fn}(${last}))` : `${fn}(${last})[0]`
    const source = `def ${fn}(item, ${acc}=[]):\n    ${acc}.append(item)\n    return ${acc}\n\n${calls}\nprint(${expr})`
    return {
      seed,
      params: { k, fn, acc, expr: printLen ? 'len' : 'first' },
      title: 'Что выведет программа?',
      prompt: 'Введите вывод программы.',
      code: { language: 'python', source },
      options: null,
      correct_answer: printLen ? String(k + 1) : String(values[0]),
    }
  },
}

const windowFamily: FamilyDefinition = {
  id: 'sql-window-top-n',
  title: 'SQL: топ-N записей в каждой группе',
  specialization: 'backend',
  competency: 'Базы данных и SQL',
  type: 'single_choice',
  a: 1.21,
  b: 1.48,
  description:
    'Нужно выбрать запрос с оконной функцией. Схема БД, N и порядок вариантов генерируются, поэтому «буква правильного ответа» не переносится между экземплярами.',
  template:
    'Вернуть по {{n}} последних строк из {{table}} для каждого {{group}}.\nВарианты: ROW_NUMBER() OVER (PARTITION BY ...) / LIMIT / GROUP BY + MAX / RANK без PARTITION',
  params: [
    { name: 'table, group, ts', description: 'Сгенерированная схема', domain: 'payments/merchant_id, sessions/user_id, orders/store_id' },
    { name: 'n', description: 'Сколько строк в группе', domain: '2..5' },
    { name: 'order', description: 'Порядок вариантов', domain: 'перестановка из 4' },
  ],
  exposureRate: 0.11,
  calibrationN: 1630,
  render: (seed) => {
    const rnd = mulberry32(seed)
    const [table, group, ts] = pick(rnd, [
      ['payments', 'merchant_id', 'created_at'],
      ['sessions', 'user_id', 'started_at'],
      ['orders', 'store_id', 'placed_at'],
    ] as const)
    const n = 2 + Math.floor(rnd() * 4)
    const variants = [
      {
        key: 'correct',
        text: `SELECT * FROM (SELECT t.*, ROW_NUMBER() OVER (PARTITION BY ${group} ORDER BY ${ts} DESC) AS rn FROM ${table} t) x WHERE rn <= ${n};`,
      },
      { key: 'limit', text: `SELECT * FROM ${table} ORDER BY ${ts} DESC LIMIT ${n};` },
      { key: 'max', text: `SELECT ${group}, MAX(${ts}) FROM ${table} GROUP BY ${group} LIMIT ${n};` },
      { key: 'rank', text: `SELECT *, RANK() OVER (ORDER BY ${ts}) AS r FROM ${table} WHERE r <= ${n};` },
    ]
    // Перестановка Фишера–Йетса с тем же сидом
    for (let i = variants.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      const tmp = variants[i]
      variants[i] = variants[j] as (typeof variants)[number]
      variants[j] = tmp as (typeof variants)[number]
    }
    const letters = ['a', 'b', 'c', 'd']
    const correctIndex = variants.findIndex((v) => v.key === 'correct')
    return {
      seed,
      params: { table, group, n, order: variants.map((v) => v.key).join(',') },
      title: `По ${n} последних строк в каждой группе`,
      prompt: `Какой запрос вернёт по ${n} последних записей из \`${table}\` для каждого \`${group}\`?`,
      code: null,
      options: variants.map((v, i) => ({ id: letters[i] ?? String(i), text: v.text })),
      correct_answer: `Вариант ${(letters[correctIndex] ?? '?').toUpperCase()}`,
    }
  },
}

export const FAMILIES: FamilyDefinition[] = [sliceFamily, mutableDefaultFamily, windowFamily]

export const SHOWCASE_SEEDS = [1729, 4242, 90210]

export function buildFamily(def: FamilyDefinition): ItemFamily {
  return {
    id: def.id,
    title: def.title,
    specialization: def.specialization,
    competency: def.competency,
    type: def.type,
    a: def.a,
    b: def.b,
    description: def.description,
    template: def.template,
    params: def.params,
    instances: SHOWCASE_SEEDS.map((seed) => def.render(seed)),
    exposure_rate: def.exposureRate,
    calibration_n: def.calibrationN,
  }
}
