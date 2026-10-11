/**
 * Черновики заданий через GigaChat. В боевой банк ничего не попадает: черновик
 * проходит автоматические проверки, затем его вычитывает эксперт (reviewed_by).
 *
 *   npm run llm:drafts -- --count 12                 # по умолчанию GigaChat-2-Max
 *   npm run llm:drafts -- --count 4 --spec backend --model GigaChat-2-Pro
 *   npm run llm:drafts -- --dry-run                  # без сети, на фикстуре
 *
 * Ключ берётся из GIGACHAT_AUTH_KEY (backend/.env, файл не в git). Сертификат НУЦ
 * Минцифры подключается только к запросам этого скрипта, в систему не ставится.
 * Персональные данные в промпт не передаются: только справочник навыков и тема.
 */
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { request } from 'node:https';
import { LIVE_BANK } from '../src/assessment/live-bank.ts';
import { seededRandom } from '../src/common/cat.ts';
import type { Specialization } from '../src/contract/model/index.js';

const ROOT = new URL('..', import.meta.url).pathname;
const SPECS: readonly Specialization[] = ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'];
const GRADES = ['junior', 'middle', 'senior'] as const;
const PROMPT_VERSION = 'llm-drafts-v2';

const args = new Map<string, string>();
process.argv.slice(2).forEach((a, i, all) => { if (a.startsWith('--')) args.set(a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? 'true' : all[i + 1]!); });
const DRY = args.get('dry-run') === 'true';
const MODEL = args.get('model') ?? 'GigaChat-2-Max';
const COUNT = Number(args.get('count') ?? 12);
const ONLY = args.get('spec') as Specialization | undefined;

function loadEnv(): Record<string, string> {
  const path = `${ROOT}.env`;
  const fromFile = existsSync(path) ? Object.fromEntries(readFileSync(path, 'utf8').split('\n')
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(m => m).map(m => [m![1]!, m![2]!.trim()])) : {};
  return { ...fromFile, ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('GIGACHAT_')).map(([k, v]) => [k, v ?? ''])) };
}

// ---------- GigaChat ----------
const CA = readFileSync(`${ROOT}certs/russian_trusted_ca_bundle.pem`);
function https(url: string, method: string, headers: Record<string, string>, body?: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = request(url, { method, headers, ca: CA, timeout: 120_000 }, res => {
      let text = ''; res.setEncoding('utf8'); res.on('data', c => { text += c; }); res.on('end', () => resolve({ status: res.statusCode ?? 0, text }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout'))); req.on('error', reject);
    if (body) req.write(body); req.end();
  });
}

let token: { value: string; expiresAt: number } | undefined;
async function accessToken(env: Record<string, string>): Promise<string> {
  // Токен живёт 30 минут, переиспользуем его, пока до истечения больше минуты.
  if (token && token.expiresAt - Date.now() > 60_000) return token.value;
  const res = await https('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', 'POST', {
    Authorization: `Basic ${env.GIGACHAT_AUTH_KEY}`, RqUID: randomUUID(), 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json',
  }, `scope=${env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS'}`);
  if (res.status !== 200) throw new Error(`OAuth GigaChat: HTTP ${res.status}`);
  const json = JSON.parse(res.text) as { access_token: string; expires_at: number };
  token = { value: json.access_token, expiresAt: json.expires_at };
  return token.value;
}

const usage = { prompt: 0, completion: 0, requests: 0 };
async function chat(env: Record<string, string>, system: string, user: string, temperature: number): Promise<string> {
  // Бесплатный режим допускает один одновременный запрос, поэтому вызовы строго последовательные.
  for (let attempt = 1; ; attempt++) {
    const res = await https('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', 'POST', {
      Authorization: `Bearer ${await accessToken(env)}`, 'Content-Type': 'application/json', Accept: 'application/json',
    }, JSON.stringify({ model: MODEL, temperature, max_tokens: 2500, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }));
    if (res.status === 429 && attempt < 5) { await new Promise(r => setTimeout(r, 3000 * attempt)); continue; }
    if (res.status === 401 && attempt < 3) { token = undefined; continue; }
    if (res.status !== 200) throw new Error(`GigaChat: HTTP ${res.status} ${res.text.slice(0, 200)}`);
    const json = JSON.parse(res.text) as { choices: { message: { content: string } }[]; usage?: { prompt_tokens: number; completion_tokens: number } };
    usage.requests++; usage.prompt += json.usage?.prompt_tokens ?? 0; usage.completion += json.usage?.completion_tokens ?? 0;
    return json.choices[0]!.message.content;
  }
}

function parseJson<T>(text: string): T {
  const body = text.replace(/^[\s\S]*?```(?:json)?\s*/i, '').replace(/```[\s\S]*$/, '');
  const start = body.search(/[[{]/), end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'));
  return JSON.parse(body.slice(start, end + 1)) as T;
}

// ---------- Справочник из боевого банка ----------
const skillsBySpec = new Map<Specialization, Set<string>>(SPECS.map(s => [s, new Set<string>()]));
for (const f of LIVE_BANK) for (const s of f.specializations) for (const k of f.skillIds) skillsBySpec.get(s)!.add(k);
const bankPrompts = LIVE_BANK.filter(f => !f.canary).flatMap(f => [1, 2, 3, 4].map(seed => f.generate(seed).prompt));
const words = (t: string) => new Set(t.toLowerCase().replace(/\d+/g, ' ').match(/[a-zа-яё_]{3,}/g) ?? []);
function nearestInBank(prompt: string): number {
  const a = words(prompt);
  return Math.max(0, ...bankPrompts.map(p => { const b = words(p); const inter = [...a].filter(x => b.has(x)).length; return inter / (a.size + b.size - inter || 1); }));
}

// ---------- Безопасный расчёт формулы ----------
const MATH = { floor: Math.floor, ceil: Math.ceil, round: Math.round, min: Math.min, max: Math.max, log2: Math.log2, sqrt: Math.sqrt, abs: Math.abs };
function compile(formula: string, params: readonly string[]): (v: Record<string, number>) => number {
  const ids = formula.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  const bad = ids.filter(id => !params.includes(id) && !(id in MATH));
  if (bad.length) throw new Error(`недопустимые имена в формуле: ${[...new Set(bad)].join(', ')}`);
  if (!/^[A-Za-z0-9_+\-*/%().,\s]+$/.test(formula)) throw new Error('недопустимые символы в формуле');
  const fn = new Function(...Object.keys(MATH), ...params, `return (${formula});`) as (...xs: number[]) => number;
  return v => fn(...Object.values(MATH), ...params.map(p => v[p]!));
}
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a));

// ---------- Генерация ----------
type NumericDraft = { kind: 'numeric'; title: string; skill: string; grade: string; params: Record<string, [number, number]>; prompt: string; formula: string; examples: { params: Record<string, number>; answer: number }[]; explanation: string };
type ChoiceDraft = { kind: 'choice'; title: string; skill: string; grade: string; type: 'single_choice'; scenarios: { prompt: string; correct: string; wrong: string[] }[]; explanation: string };

const SYSTEM = 'Ты методист технических собеседований. Пишешь задания для объективного теста ИТ-специалистов. ' +
  'Задание проверяет понимание, а не память на факты; у него ровно один правильный ответ, который не зависит от мнения. ' +
  'Отвечай только JSON без пояснений вокруг.';

function numericPrompt(spec: Specialization, skills: string[], grade: string): string {
  return `Специализация: ${spec}. Грейд: ${grade}. Навыки на выбор: ${skills.join(', ')}.
Придумай параметрическое задание с числовым ответом. Числа в условии — целые параметры, ответ вычисляется формулой.
Формат JSON:
{"title":"короткое название","skill":"один навык из списка","grade":"${grade}",
 "params":{"a":[мин,макс],"b":[мин,макс]},
 "prompt":"условие на русском, параметры в фигурных скобках: {a}, {b}",
 "formula":"арифметика над параметрами; разрешены + - * / % ( ), floor, ceil, round, min, max, log2, sqrt, abs",
 "examples":[{"params":{"a":..,"b":..},"answer":..},{"params":{...},"answer":..}],
 "explanation":"как решать"}
Требования:
- ситуация реалистична и технически верна для этого навыка; не выдумывай устройство технологий;
- для junior достаточно двух шагов рассуждения, для middle и senior нужна модель ситуации (пределы, округление, узкое место), а не одно умножение;
- от 2 до 4 параметров; при любых значениях из диапазонов условие корректно, ответ — конечное число;
- числа в тексте ставь так, чтобы не ломалось согласование: «узлов: {a}», а не «{a} узлов»;
- в условии нет подсказки к ответу; задание не про запоминание синтаксиса.`;
}

function choicePrompt(spec: Specialization, skills: string[], grade: string): string {
  return `Специализация: ${spec}. Грейд: ${grade}. Навыки на выбор: ${skills.join(', ')}.
Придумай семейство заданий с одним правильным вариантом из четырёх. Нужны 4 формулировки одной ситуации,
у которых правильные ответы РАЗНЫЕ (чтобы слитый ключ одной формулировки не подходил к другой).
В каждой формулировке есть число {n} — оно подставляется случайно и на ответ не влияет.
Формат JSON:
{"title":"короткое название","skill":"один навык из списка","grade":"${grade}","type":"single_choice",
 "scenarios":[{"prompt":"условие с {n}","correct":"правильный вариант","wrong":["неверный 1","неверный 2","неверный 3"]}, ... ровно 4],
 "explanation":"почему верен правильный вариант в каждой формулировке"}
Требования:
- в каждой формулировке ПО СУТИ другой правильный ответ (другой механизм или решение), а не перефразировка одного и того же;
- {n} — естественная часть условия (размер таблицы, число запросов, пользователей), а не приписка в конце;
- неверные варианты — типичные ошибки, которые реально делают кандидаты уровнем ниже: правдоподобные, без абсурда и шуток;
- правильный вариант технически верен без оговорок; все варианты примерно одной длины.`;
}

async function blindNumeric(env: Record<string, string>, prompt: string): Promise<number | null> {
  const text = await chat(env, 'Реши задачу. Ответь только JSON {"answer": число}.', prompt, 0.1);
  try { const v = Number(parseJson<{ answer: number }>(text).answer); return Number.isFinite(v) ? v : null; } catch { return null; }
}
async function blindChoice(env: Record<string, string>, prompt: string, options: string[]): Promise<number | null> {
  const text = await chat(env, 'Выбери единственный верный вариант. Ответь только JSON {"option": номер с 1}.',
    `${prompt}\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`, 0.1);
  try { const v = Number(parseJson<{ option: number }>(text).option); return Number.isInteger(v) ? v - 1 : null; } catch { return null; }
}

async function review(env: Record<string, string>, draft: NumericDraft | ChoiceDraft): Promise<{ ok: boolean; problems: string[] }> {
  // Второй проход: рецензент ищет фактические ошибки ключа и слабые дистракторы. Это фильтр, а не замена эксперту.
  const text = await chat(env, 'Ты строгий рецензент заданий для технических тестов. Отвечай только JSON.',
    `Проверь задание. Ключ верен без оговорок? Условие однозначно и технически корректно? Неверные варианты правдоподобны, но точно неверны? ` +
    `Задание соответствует грейду ${draft.grade}? Ответ JSON: {"ok": true|false, "problems": ["..."]}\n${JSON.stringify(draft)}`, 0.1);
  try { const r = parseJson<{ ok: boolean; problems?: string[] }>(text); return { ok: r.ok === true, problems: r.problems ?? [] }; } catch { return { ok: false, problems: ['рецензент не вернул JSON'] }; }
}

function render(text: string, values: Record<string, number>): string {
  return text.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

async function checkNumeric(env: Record<string, string>, d: NumericDraft, spec: Specialization) {
  const issues: string[] = [];
  const names = Object.keys(d.params ?? {});
  const placeholders = [...new Set([...(d.prompt ?? '').matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map(m => m[1]!))];
  if (names.length < 2 || names.length > 4) issues.push(`параметров ${names.length}, нужно 2–4`);
  if (placeholders.sort().join() !== [...names].sort().join()) issues.push('параметры в условии и в params не совпадают');
  for (const [k, r] of Object.entries(d.params ?? {})) if (!Array.isArray(r) || !Number.isInteger(r[0]) || !Number.isInteger(r[1]) || r[0] >= r[1]) issues.push(`плохой диапазон ${k}`);
  if (!skillsBySpec.get(spec)!.has(d.skill)) issues.push(`навык ${d.skill} не из справочника специализации`);
  let keyCheck = 'not_run', sample: { params: Record<string, number>; prompt: string; answer: number } | undefined;
  try {
    const f = compile(d.formula, names);
    const mismatches = (d.examples ?? []).filter(e => !close(f(e.params), Number(e.answer)));
    const ops = (d.formula.match(/[+\-*/%]|floor|ceil|round|min|max|log2|sqrt/g) ?? []).length;
    if (d.grade !== 'junior' && ops < 2) issues.push(`формула из ${ops} операции слишком проста для ${d.grade}`);
    keyCheck = mismatches.length ? `mismatch_${mismatches.length}_of_${d.examples.length}` : (d.examples?.length ? 'matches_model_examples' : 'no_examples');
    if (mismatches.length) issues.push('ответ формулы расходится с примерами модели');
    const rnd = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const v = Object.fromEntries(names.map(n => { const [lo, hi] = d.params[n]!; return [n, lo + Math.floor(rnd() * (hi - lo + 1))]; }));
      const ans = f(v);
      if (!Number.isFinite(ans)) { issues.push('формула даёт нечисловой ответ на части диапазона'); break; }
      if (i === 0) sample = { params: v, prompt: render(d.prompt, v), answer: Math.round(ans * 1000) / 1000 };
    }
  } catch (e) { issues.push(`формула: ${(e as Error).message}`); keyCheck = 'formula_error'; }
  let blind = 'not_run';
  if (sample && !DRY) {
    const got = await blindNumeric(env, sample.prompt);
    blind = got === null ? 'no_answer' : close(got, sample.answer) ? 'agree' : `disagree (модель: ${got}, ключ: ${sample.answer})`;
  }
  return { issues, keyCheck, blind, sample };
}

async function checkChoice(env: Record<string, string>, d: ChoiceDraft, spec: Specialization) {
  const issues: string[] = [];
  const sc = d.scenarios ?? [];
  if (sc.length !== 4) issues.push(`формулировок ${sc.length}, нужно 4`);
  for (const [i, s] of sc.entries()) {
    if (!s.prompt?.includes('{n}')) issues.push(`формулировка ${i + 1} без {n}`);
    if (s.wrong?.length !== 3) issues.push(`формулировка ${i + 1}: неверных вариантов ${s.wrong?.length ?? 0}, нужно 3`);
    if (new Set([s.correct, ...(s.wrong ?? [])].map(x => x.trim().toLowerCase())).size !== 1 + (s.wrong?.length ?? 0)) issues.push(`формулировка ${i + 1}: повторяются варианты`);
  }
  if (new Set(sc.map(s => s.correct.trim().toLowerCase())).size < sc.length) issues.push('правильные ответы формулировок совпадают: слитый ключ переносится');
  for (const [i, s] of sc.entries()) if (/\{n\}[\s.?!]*$/.test(s.prompt ?? '')) issues.push(`формулировка ${i + 1}: {n} приписано в конце, а не встроено в условие`);
  for (let i = 0; i < sc.length; i++) for (let j = i + 1; j < sc.length; j++) {
    const a = words(sc[i]!.correct), b = words(sc[j]!.correct), inter = [...a].filter(x => b.has(x)).length;
    if (inter / (a.size + b.size - inter || 1) >= 0.5) issues.push(`правильные ответы формулировок ${i + 1} и ${j + 1} по сути совпадают`);
  }
  if (!skillsBySpec.get(spec)!.has(d.skill)) issues.push(`навык ${d.skill} не из справочника специализации`);
  let blind = 'not_run';
  if (!DRY && sc.length) {
    const results: string[] = [];
    for (const s of sc) {
      const options = [s.correct, ...s.wrong].sort((a, b) => createHash('md5').update(a).digest('hex').localeCompare(createHash('md5').update(b).digest('hex')));
      const got = await blindChoice(env, render(s.prompt, { n: 1000 }), options);
      results.push(got === null ? 'no_answer' : options[got] === s.correct ? 'agree' : 'disagree');
    }
    blind = results.every(r => r === 'agree') ? 'agree' : results.join(',');
  }
  return { issues, keyCheck: 'author_key', blind };
}

const FIXTURE: NumericDraft = {
  kind: 'numeric', title: 'Пропускная способность пула воркеров', skill: 'system_design', grade: 'middle',
  params: { w: [2, 16], t: [50, 400], s: [10, 120] },
  prompt: 'Пул из {w} воркеров обрабатывает задачи по {t} мс каждая. Сколько задач успеет обработать пул за {s} секунд при полной загрузке?',
  formula: 'w * floor(s * 1000 / t)', examples: [{ params: { w: 4, t: 200, s: 10 }, answer: 200 }, { params: { w: 3, t: 300, s: 2 }, answer: 18 }],
  explanation: 'Каждый воркер успевает floor(s*1000/t) задач, воркеры работают параллельно.',
};

async function main() {
  const env = loadEnv();
  if (!DRY && !env.GIGACHAT_AUTH_KEY) throw new Error('Нет GIGACHAT_AUTH_KEY в backend/.env. Для проверки без сети: --dry-run');
  const specs = ONLY ? [ONLY] : SPECS;
  const drafts = [];
  for (let i = 0; i < COUNT; i++) {
    const spec = specs[i % specs.length]!, grade = GRADES[i % GRADES.length]!, kind = i % 2 === 0 ? 'numeric' : 'choice';
    const skills = [...skillsBySpec.get(spec)!].sort();
    const userPrompt = kind === 'numeric' ? numericPrompt(spec, skills, grade) : choicePrompt(spec, skills, grade);
    process.stdout.write(`[${i + 1}/${COUNT}] ${spec} · ${grade} · ${kind} … `);
    let draft: NumericDraft | ChoiceDraft;
    try {
      draft = DRY ? FIXTURE : { ...parseJson<NumericDraft | ChoiceDraft>(await chat(env, SYSTEM, userPrompt, 0.7)), kind } as NumericDraft | ChoiceDraft;
    } catch (e) { console.log(`ошибка: ${(e as Error).message}`); continue; }
    const check = draft.kind === 'numeric' ? await checkNumeric(env, draft, spec) : await checkChoice(env, draft, spec);
    const critic = DRY || check.issues.length ? { ok: true, problems: [] as string[] } : await review(env, draft);
    if (!critic.ok) check.issues.push(...critic.problems.map(p => `рецензент: ${p}`));
    const firstPrompt = draft.kind === 'numeric' ? draft.prompt : draft.scenarios?.[0]?.prompt ?? '';
    const similarity = Math.round(nearestInBank(firstPrompt) * 100) / 100;
    if (similarity >= 0.6) check.issues.push(`похоже на задание из банка (Jaccard ${similarity})`);
    const status = check.issues.length ? 'rejected_auto' : check.blind === 'agree' || DRY ? 'needs_expert_review' : 'needs_expert_review_blind_disagree';
    console.log(status);
    drafts.push({
      id: `llm-${spec}-${createHash('sha256').update(JSON.stringify(draft)).digest('hex').slice(0, 10)}`,
      specialization: spec, ...draft, status,
      checks: { issues: check.issues, key: check.keyCheck, blind_solve: check.blind, reviewer: critic.ok ? 'ok' : 'rejected', nearest_bank_similarity: similarity, ...('sample' in check && check.sample ? { sample: check.sample } : {}) },
      provenance: { model: DRY ? 'fixture' : MODEL, prompt_version: PROMPT_VERSION, prompt_sha256: createHash('sha256').update(SYSTEM + userPrompt).digest('hex'), created_at: new Date().toISOString(), reviewed_by: null },
    });
  }
  const dir = `${ROOT}llm-drafts`; mkdirSync(dir, { recursive: true });
  const file = `${dir}/${new Date().toISOString().slice(0, 10)}-${DRY ? 'dry-run' : MODEL}.json`;
  const summary = Object.fromEntries(['needs_expert_review', 'needs_expert_review_blind_disagree', 'rejected_auto'].map(s => [s, drafts.filter(d => d.status === s).length]));
  writeFileSync(file, JSON.stringify({ generated_by: 'npm run llm:drafts', model: DRY ? 'fixture' : MODEL, usage, summary, drafts }, null, 2) + '\n');
  console.log(`\n${file.replace(ROOT, 'backend/')}\n`, summary, `запросов ${usage.requests}, токенов ${usage.prompt + usage.completion}`);
}

main().catch(e => { console.error((e as Error).message); process.exit(1); });
