import { writeFileSync } from 'node:fs';
import { selectWithWaiver, seededRandom, type CatState } from '../src/common/cat.ts';
import { LIVE_BANK, LIVE_BANK_VERSION, instantiate, requiredCompetencies, type LiveFamily } from '../src/assessment/live-bank.ts';
import { coveredCompetencies, DEFAULT_GRADE_POLICY, DEFAULT_POLICY, exposure, type SessionPolicy } from '../src/assessment/session-state.ts';
import { scoreCompletion, type CompletionItem } from '../src/assessment/completion.ts';
import { GRADE_ORDER, empiricalPercentile, modelPercentile, scoreOutcome, type GradeCuts } from '../src/assessment/result-scoring.ts';
import { gradeAnswer } from '../src/assessment/grading.ts';
import { confirmedSkills } from '../src/assessment/confirmed-skills.ts';
import { category, explain, hardFilters, type CandidateSnapshot } from '../src/matching/matching.ts';
import { rankingMetrics } from '../src/evaluation/metrics.ts';
import { rankExternal } from '../src/evaluation/rank.ts';
import { SKILLS, SKILL_BY_ID, skillName, taxonomy } from '../src/common/taxonomy-data.ts';
import type { CandidateSkill, FspAchievement, Grade, Industry, SearchFilters, Specialization, WorkFormat } from '../src/contract/model/index.js';

const SEED = Number(process.env.EVAL_SEED ?? 20261010), N = 2000, LEAK_N = 600, BOOT = 1000, K = 10, DUMP = 300;
const SPECS: Specialization[] = ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'];
const CUTS = { ...JSON.parse(DEFAULT_GRADE_POLICY), ...(process.env.EVAL_PASS ? { passProbability: Number(process.env.EVAL_PASS) } : {}) } as GradeCuts;
const NOW = new Date('2026-10-10T00:00:00Z');
const COMPANY = 'eval-company';
const started = performance.now();

const normal = (r: () => number) => Math.sqrt(-2 * Math.log(Math.max(1e-12, r()))) * Math.cos(2 * Math.PI * r());
const int = (r: () => number, from: number, to: number) => from + Math.floor(r() * (to - from + 1));
const mean = (xs: readonly number[]) => xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
const r4 = (x: number) => Math.round(x * 10000) / 10000;
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const level = (theta: number) => GRADE_ORDER.filter(g => theta >= CUTS.cuts[g]).length;
const gradeOf = (index: number): Grade => GRADE_ORDER[index - 1]!;
const seedOf = (r: () => number) => Math.floor(r() * 2147483647);
function pearson(a: readonly number[], b: readonly number[]) {
  const ma = mean(a), mb = mean(b);
  return a.reduce((s, x, i) => s + (x - ma) * (b[i]! - mb), 0) / Math.sqrt(a.reduce((s, x) => s + (x - ma) ** 2, 0) * b.reduce((s, x) => s + (x - mb) ** 2, 0));
}
function qwk(a: readonly number[], b: readonly number[], classes = 5) {
  const observed = Array.from({ length: classes }, () => new Array<number>(classes).fill(0));
  const ha = new Array<number>(classes).fill(0), hb = new Array<number>(classes).fill(0);
  a.forEach((x, i) => { observed[x]![b[i]!]!++; ha[x]!++; hb[b[i]!]!++; });
  let num = 0, den = 0;
  for (let i = 0; i < classes; i++) for (let j = 0; j < classes; j++) {
    const w = (i - j) ** 2 / (classes - 1) ** 2;
    num += w * observed[i]![j]!; den += w * ha[i]! * hb[j]! / a.length;
  }
  return den ? 1 - num / den : 1;
}
function ci(n: number, stat: (idx: number[]) => number, seed: number): [number, number] {
  const r = seededRandom(seed);
  const values = Array.from({ length: BOOT }, () => stat(Array.from({ length: n }, () => Math.floor(r() * n)))).sort((x, y) => x - y);
  return [r4(values[Math.floor(0.025 * BOOT)]!), r4(values[Math.ceil(0.975 * BOOT) - 1]!)];
}
let ciSeed = SEED;
const metric = (n: number, stat: (idx: number[]) => number) => ({ value: r4(stat(Array.from({ length: n }, (_, i) => i))), ci95: ci(n, stat, ++ciSeed) });

const truthRandom = seededRandom(SEED ^ 0x5eed);
const TRUE = new Map(LIVE_BANK.map(f => [f.id, { a: f.a * (0.7 + 0.6 * truthRandom()), b: f.b - 0.4 + 0.8 * truthRandom(), c: 0.02 }]));
const solveProbability = (theta: number, f: LiveFamily) => {
  const t = TRUE.get(f.id)!;
  return t.c + (1 - t.c) * sigmoid(t.a * (theta - t.b));
};
const BANKS = new Map(SPECS.map(s => [s, LIVE_BANK.filter(f => f.specializations.includes(s))]));

type Answerer = (family: LiveFamily, instanceSeed: number, r: () => number) => boolean;
type Item = CompletionItem & { familyId: string };
interface Cohort { sessions: Map<Specialization, number>; usage: Map<string, number> }
interface Session { theta: number; se: number; outcome: string; length: number; items: Item[]; stop: string; waived: number }
const cohort = (): Cohort => ({ sessions: new Map(), usage: new Map() });
const honest = (theta: number): Answerer => (f, _seed, r) => r() < solveProbability(theta, f);

function runSession(spec: Specialization, declared: Grade, seed: number, pool: Cohort, answer: Answerer): Session {
  const bank = BANKS.get(spec)!;
  const policy: SessionPolicy = { ...DEFAULT_POLICY, practiceTotal: 0, approachTotal: 0, gradeCuts: CUTS,
    familyIds: bank.map(f => f.id), requiredCompetencies: requiredCompetencies(bank, DEFAULT_POLICY.maxExposure) };
  const total = (pool.sessions.get(spec) ?? 0) + 1;
  pool.sessions.set(spec, total);
  const r = seededRandom(seed), items: Item[] = [], state: CatState = { responses: [], servedIds: [], competencyCounts: {} };
  let stop = '';
  while (!stop) {
    const blocked: Record<string, number> = {};
    for (const f of bank) blocked[f.id] = exposure(total, pool.usage.get(`${spec}:${f.id}`) ?? 0, policy.maxExposure).canServe ? 0 : 1;
    const choice = selectWithWaiver(bank, state, policy, blocked, coveredCompetencies(policy), seededRandom(seed ^ Math.imul(items.length + 1, 0x9e3779b1)));
    if (choice.waived.length) policy.waivedCompetencies = [...policy.waivedCompetencies ?? [], ...choice.waived];
    if (!choice.family) { stop = choice.reason; break; }
    const family = choice.family as LiveFamily;
    const correct = answer(family, seedOf(r), r);
    pool.usage.set(`${spec}:${family.id}`, (pool.usage.get(`${spec}:${family.id}`) ?? 0) + 1);
    items.push({ id: String(items.length + 1), ordinal: items.length + 1, block: 'adaptive', answeredAt: NOW, correct,
      competency: family.competency, discrimination: family.a, difficulty: family.b, familyId: family.id });
    state.responses.push({ a: family.a, b: family.b, correct });
    state.servedIds.push(family.id);
    state.competencyCounts[family.competency] = (state.competencyCounts[family.competency] ?? 0) + 1;
  }
  const scored = scoreCompletion(items, policy, declared, CUTS);
  return { theta: scored.theta, se: scored.se, outcome: scored.outcome, length: items.length, items, stop, waived: policy.waivedCompetencies?.length ?? 0 };
}

function followSuggestions(first: Session, spec: Specialization, declared: number, seed: number, pool: Cohort, answer: Answerer) {
  let session = first, index = declared, direction = 0, assigned = 0, passed: Session | null = null, attempts = 1;
  for (;;) {
    if (session.outcome === 'failed') {
      if (direction > 0 || index === 1 || attempts >= 4) break;
      direction = -1; index--;
    } else {
      assigned = index; passed = session;
      if (session.outcome !== 'passed_confident' || direction < 0 || index === 4 || attempts >= 4) break;
      direction = 1; index++;
    }
    session = runSession(spec, gradeOf(index), seed + 7919 * attempts++, pool, answer);
  }
  return { assigned, passed, attempts };
}

const master = seededRandom(SEED);
const people = Array.from({ length: N }, (_, i) => {
  const theta = normal(master), truth = level(theta), u = master();
  const declared = Math.max(1, Math.min(4, Math.max(1, truth) + (u < 0.6 ? 0 : u < 0.8 ? 1 : -1)));
  return { spec: SPECS[i % SPECS.length]!, theta, truth, declared, seeds: [seedOf(master), seedOf(master)] };
});
const waveA = cohort(), waveB = cohort();
const first = people.map(p => runSession(p.spec, gradeOf(p.declared), p.seeds[0]!, waveA, honest(p.theta)));
const exposureSnapshot = SPECS.map(spec => {
  const sessions = waveA.sessions.get(spec)!, bank = BANKS.get(spec)!;
  const rates = bank.map(f => (waveA.usage.get(`${spec}:${f.id}`) ?? 0) / sessions);
  return { specialization: spec, sessions, families: bank.length, max_rate: r4(Math.max(...rates)), mean_rate: r4(mean(rates)),
    unused_families: rates.filter(x => x === 0).length, items_per_session: r4(mean(first.filter((_, i) => people[i]!.spec === spec).map(s => s.length))) };
});
const flows = people.map((p, i) => followSuggestions(first[i]!, p.spec, p.declared, p.seeds[0]!, waveA, honest(p.theta)));
const second = people.map(p => runSession(p.spec, gradeOf(p.declared), p.seeds[1]!, waveB, honest(p.theta)));

const theta = people.map(p => p.theta), truth = people.map(p => p.truth);
const est = first.map(s => s.theta), band = est.map(level), band2 = second.map(s => level(s.theta));
const confirmed = first.map(s => s.outcome !== 'failed'), eligible = people.map(p => p.truth >= p.declared);
const assigned = flows.map(f => f.assigned);
const pick = <T>(xs: readonly T[], idx: number[]) => idx.map(i => xs[i]!);
const share = (idx: number[], ok: (i: number) => boolean, where: (i: number) => boolean = () => true) => {
  const base = idx.filter(where);
  return base.length ? base.filter(ok).length / base.length : 0;
};
const confusion = Array.from({ length: 5 }, (_, t) => Array.from({ length: 5 }, (_, e) => people.filter((_, i) => truth[i] === t && band[i] === e).length));

const FORMS = new Map(SPECS.map(spec => {
  const ordered = [...BANKS.get(spec)!].sort((a, b) => a.b - b.b || a.id.localeCompare(b.id));
  return [spec, Array.from({ length: 12 }, (_, i) => ordered[Math.floor((i + 0.5) * ordered.length / 12)]!)];
}));
function fixedSession(spec: Specialization, declared: Grade, seed: number, thetaTrue: number, known: ReadonlySet<string>) {
  const r = seededRandom(seed);
  const responses = FORMS.get(spec)!.map(f => {
    const solved = r() < solveProbability(thetaTrue, f);
    return { a: f.a, b: f.b, correct: solved || known.has(f.id) };
  });
  return scoreOutcome(responses, declared, CUTS);
}
const fixed = people.map(p => fixedSession(p.spec, gradeOf(p.declared), p.seeds[0]!, p.theta, new Set()));
const fixedBand = fixed.map(s => level(s.theta));

const assessment = {
  population: { n: N, theta_distribution: 'N(0,1)', true_grade_counts: Object.fromEntries(['below_junior', ...GRADE_ORDER].map((g, i) => [g, truth.filter(t => t === i).length])),
    declared: '60% истинный грейд, 20% на ступень выше, 20% на ступень ниже (в пределах junior–lead)', specializations: SPECS },
  grade_by_theta: {
    exact: metric(N, idx => share(idx, i => band[i] === truth[i])),
    within_one: metric(N, idx => share(idx, i => Math.abs(band[i]! - truth[i]!) <= 1)),
    quadratic_kappa: metric(N, idx => qwk(pick(band, idx), pick(truth, idx))),
    pearson_theta: metric(N, idx => pearson(pick(est, idx), pick(theta, idx))),
    rmse: metric(N, idx => Math.sqrt(mean(idx.map(i => (est[i]! - theta[i]!) ** 2)))),
    confusion_true_rows_estimated_columns: confusion,
  },
  confirmation_decision: {
    accuracy: metric(N, idx => share(idx, i => confirmed[i] === eligible[i])),
    false_reject_rate: metric(N, idx => share(idx, i => !confirmed[i], i => eligible[i]!)),
    false_confirm_rate: metric(N, idx => share(idx, i => confirmed[i]!, i => !eligible[i])),
    eligible_share: r4(mean(eligible.map(Number))),
    false_reject_by_true_minus_declared: Object.fromEntries([0, 1, 2, 3].map(d => [String(d), r4(share(people.map((_, i) => i), i => !confirmed[i], i => truth[i]! - people[i]!.declared === d))])),
  },
  product_flow_grade: {
    exact: metric(N, idx => share(idx, i => assigned[i] === truth[i])),
    within_one: metric(N, idx => share(idx, i => Math.abs(assigned[i]! - truth[i]!) <= 1)),
    quadratic_kappa: metric(N, idx => qwk(pick(assigned, idx), pick(truth, idx))),
    over_assigned: r4(mean(people.map((_, i) => Number(assigned[i]! > truth[i]!)))),
    under_assigned: r4(mean(people.map((_, i) => Number(assigned[i]! < truth[i]!)))),
    mean_attempts: r4(mean(flows.map(f => f.attempts))),
  },
  length: { mean: r4(mean(first.map(s => s.length))), min: Math.min(...first.map(s => s.length)), max: Math.max(...first.map(s => s.length)),
    mean_se: r4(mean(first.map(s => s.se))), sessions_with_waived_coverage: first.filter(s => s.waived > 0).length, stop_reasons: Object.fromEntries([...new Set(first.map(s => s.stop))].map(k => [k, first.filter(s => s.stop === k).length])) },
  fixed_12_item_form: {
    exact: metric(N, idx => share(idx, i => fixedBand[i] === truth[i])),
    quadratic_kappa: metric(N, idx => qwk(pick(fixedBand, idx), pick(truth, idx))),
    pearson_theta: metric(N, idx => pearson(pick(fixed.map(s => s.theta), idx), pick(theta, idx))),
    rmse: metric(N, idx => Math.sqrt(mean(idx.map(i => (fixed[i]!.theta - theta[i]!) ** 2)))),
  },
};

const retest = {
  exact_agreement: metric(N, idx => share(idx, i => band[i] === band2[i])),
  quadratic_kappa: metric(N, idx => qwk(pick(band, idx), pick(band2, idx))),
  decision_agreement: metric(N, idx => share(idx, i => confirmed[i] === (second[i]!.outcome !== 'failed'))),
  pearson_theta: metric(N, idx => pearson(pick(est, idx), pick(second.map(s => s.theta), idx))),
  shared_families_mean: r4(mean(people.map((_, i) => second[i]!.items.filter(x => first[i]!.items.some(y => y.familyId === x.familyId)).length))),
};

const leakRandom = seededRandom(SEED ^ 0x1eaf);
const DUMPS = new Map(LIVE_BANK.map(f => {
  const prompts = new Map<string, number>(), counts = new Map<string, number>();
  for (let i = 0; i < DUMP; i++) {
    const instance = instantiate(f, seedOf(leakRandom), 'leak', 1);
    if (instance.expectedAnswer.kind !== 'numeric') throw new Error('Live bank must be numeric');
    prompts.set(instance.publicItem.prompt, instance.expectedAnswer.value);
    counts.set(String(instance.expectedAnswer.value), (counts.get(String(instance.expectedAnswer.value)) ?? 0) + 1);
  }
  return [f.id, { prompts, modal: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0] }];
}));
function keyHit(f: LiveFamily, seed: number) {
  const instance = instantiate(f, seed, 'probe', 1), dump = DUMPS.get(f.id)!;
  if (dump.prompts.has(instance.publicItem.prompt)) return true;
  const graded = gradeAnswer(instance.publicItem, instance.expectedAnswer, { text: dump.modal });
  return graded.status === 'evaluated' && graded.correct;
}
const hitRates = LIVE_BANK.map(f => ({ id: f.id, rate: mean(Array.from({ length: 200 }, () => Number(keyHit(f, seedOf(leakRandom))))) })).sort((a, b) => b.rate - a.rate);

const cheaters = Array.from({ length: LEAK_N }, (_, i) => {
  let value = normal(master);
  while (value >= CUTS.cuts.middle) value = normal(master);
  return { spec: SPECS[i % SPECS.length]!, theta: value, seed: seedOf(master) };
});
const shuffle = (ids: readonly string[], seed: number) => {
  const r = seededRandom(seed);
  return ids.map(id => ({ id, k: r() })).sort((a, b) => a.k - b.k).map(x => x.id);
};
const leakOrder = new Map(SPECS.map((spec, i) => [spec, shuffle(BANKS.get(spec)!.map(f => f.id), SEED + 101 * i)]));
const formOrder = new Map(SPECS.map((spec, i) => [spec, shuffle(FORMS.get(spec)!.map(f => f.id), SEED + 103 * i)]));
const leaked = (order: readonly string[], k: number) => new Set(order.slice(0, Math.round(order.length * k / 100)));
function catScenario(kind: 'none' | 'key' | 'method', k: number) {
  const pool = cohort();
  return cheaters.map(c => {
    const known = leaked(leakOrder.get(c.spec)!, kind === 'none' ? 0 : k), base = honest(c.theta);
    return runSession(c.spec, 'middle', c.seed, pool, (f, seed, r) => {
      const solved = base(f, seed, r);
      return solved || (known.has(f.id) && (kind === 'method' || keyHit(f, seed)));
    });
  });
}
const fixedScenario = (k: number) => cheaters.map(c => fixedSession(c.spec, 'middle', c.seed, c.theta, leaked(formOrder.get(c.spec)!, k)));
function leakSummary(rows: readonly { theta: number; outcome: string; length?: number }[], baseline: readonly { theta: number }[]) {
  return {
    bias_theta: metric(LEAK_N, idx => mean(idx.map(i => rows[i]!.theta - cheaters[i]!.theta))),
    inflation_vs_clean: metric(LEAK_N, idx => mean(idx.map(i => rows[i]!.theta - baseline[i]!.theta))),
    false_confirm_rate: metric(LEAK_N, idx => share(idx, i => rows[i]!.outcome !== 'failed')),
    ...(rows[0]?.length !== undefined ? { mean_length: r4(mean(rows.map(x => x.length!))) } : {}),
  };
}
const catClean = catScenario('none', 0), fixedClean = fixedScenario(0);
const bankLeak = {
  cheaters: { n: LEAK_N, theta: 'N(0,1) ниже порога middle (-0.4)', declared: 'middle', mean_theta: r4(mean(cheaters.map(c => c.theta))) },
  instance_key_dump: { instances_per_family: DUMP, mean_hit_rate: r4(mean(hitRates.map(x => x.rate))), median_hit_rate: r4(hitRates[Math.floor(hitRates.length / 2)]!.rate),
    families_hit_rate_over_10pct: hitRates.filter(x => x.rate > 0.1).length, families_hit_rate_over_50pct: hitRates.filter(x => x.rate > 0.5).length, worst_families: hitRates.slice(0, 5).map(x => ({ family: x.id, hit_rate: r4(x.rate) })) },
  cat: { clean: leakSummary(catClean, catClean),
    ...Object.fromEntries([25, 50, 100].flatMap(k => [[`key_${k}`, leakSummary(catScenario('key', k), catClean)], [`method_${k}`, leakSummary(catScenario('method', k), catClean)]])) },
  fixed_12: { clean: leakSummary(fixedClean, fixedClean), ...Object.fromEntries([25, 50, 100].map(k => [`leak_${k}`, leakSummary(fixedScenario(k), fixedClean)])) },
};

const exposureReport = {
  sessions: N, ceiling: DEFAULT_POLICY.maxExposure, by_specialization: exposureSnapshot,
  max_rate: Math.max(...exposureSnapshot.map(x => x.max_rate)), mean_rate: r4(mean(exposureSnapshot.map(x => x.mean_rate))),
  retest_shared_families_mean: retest.shared_families_mean,
};

const SPEC_SKILLS = new Map(SPECS.map(s => [s, SKILLS.filter(k => k.specializations.includes(s)).map(k => k.id).slice(0, 14)]));
const INDUSTRIES = taxonomy.industries.map(x => x.id) as Industry[];
const FORMATS: WorkFormat[] = ['office', 'hybrid', 'remote'];
const BASE_SALARY = [0, 90000, 180000, 300000, 420000];
function sample(r: () => number, ids: readonly string[], count: number, exclude: ReadonlySet<string> = new Set()) {
  const pool = ids.filter(id => !exclude.has(id)).map(id => ({ id, w: 1 / Math.sqrt(ids.indexOf(id) + 1) }));
  const out: string[] = [];
  while (out.length < count && pool.length) {
    let x = r() * pool.reduce((s, p) => s + p.w, 0), j = 0;
    while (j < pool.length - 1 && x > pool[j]!.w) x -= pool[j++]!.w;
    out.push(pool.splice(j, 1)[0]!.id);
  }
  return out;
}
interface Person { id: string; spec: Specialization; truth: number; estimate: number; competence: Map<string, number>; resumeGrade: number; snapshots: Record<Variant, CandidateSnapshot>; text: string; inflator: boolean }
type Variant = 'full' | 'no_test' | 'no_fsp' | 'no_tasks';
interface Need { id: string; spec: Specialization; grade: number; must: string[]; nice: string[]; filters: SearchFilters; text: string }

function world(seed: number, perSpec: number, needsPerSpec: number) {
  const r = seededRandom(seed), pool = cohort(), persons: Person[] = [], needs: Need[] = [];
  let tested = 0, verifiedPeople = 0;
  for (const spec of SPECS) for (let n = 0; n < perSpec; n++) {
    const thetaTrue = normal(r), truthLevel = level(thetaTrue), skills = SPEC_SKILLS.get(spec)!;
    const stack = sample(r, skills, int(r, 4, 7));
    const competence = new Map(stack.map(id => [id, thetaTrue + 0.6 * normal(r)]));
    const inflator = r() < 0.25;
    const claimed = [...stack.filter(() => r() < 0.9), ...sample(r, skills, inflator ? int(r, 3, 5) : r() < 0.3 ? 1 : 0, new Set(stack))];
    const u = r();
    const resumeGrade = Math.max(1, Math.min(4, Math.max(1, truthLevel) + (inflator ? 1 : u < 0.7 ? 0 : u < 0.85 ? 1 : -1)));
    const answer: Answerer = (f, _s, rr) => {
      const shift = f.skillIds.length ? mean(f.skillIds.map(k => competence.has(k) ? competence.get(k)! - thetaTrue : -0.8)) : 0;
      return rr() < solveProbability(thetaTrue + shift, f);
    };
    const sessionSeed = seedOf(r);
    const flow = followSuggestions(runSession(spec, gradeOf(resumeGrade), sessionSeed, pool, answer), spec, resumeGrade, sessionSeed, pool, answer);
    tested += flow.attempts;
    const verified = flow.passed ? confirmedSkills(true, flow.passed.items, LIVE_BANK, SKILL_BY_ID) : [];
    if (verified.length) verifiedPeople++;
    const resumeSkills: CandidateSkill[] = claimed.map(id => ({ skill_id: id, name: skillName(id), level: 'confident', source: 'resume', verified: false, score: null }));
    const industries = sample(r, INDUSTRIES, int(r, 1, 2)) as Industry[];
    const from = Math.round(BASE_SALARY[resumeGrade]! * Math.exp(0.15 * normal(r)) / 1000) * 1000;
    const formats = FORMATS.filter(() => r() < 0.6);
    const fsp: FspAchievement[] = [];
    if (r() < 0.15 + 0.2 * sigmoid(2 * thetaTrue)) for (let a = int(r, 1, 3); a > 0; a--) {
      const z = thetaTrue + 0.7 * normal(r), z2 = thetaTrue + 0.8 * normal(r), d = r();
      fsp.push({ id: `fsp-${persons.length}-${a}`, event_id: `event-${a}`, title: 'Чемпионат по спортивному программированию',
        date: new Date(NOW.getTime() - r() * 3 * 365.25 * 86400000).toISOString().slice(0, 10),
        level: z > 1.5 ? 'international' : z > 0.5 ? 'national' : 'regional', discipline: d < 0.5 ? 'product' : d < 0.85 ? 'algorithmic' : 'cybersecurity',
        format: 'team', team: null, role: null, place: null, participants_total: null, percentile: null,
        result: z2 > 1.3 ? 'winner' : z2 > 0.6 ? 'prize_winner' : z2 > -0.2 ? 'finalist' : 'participant', sport_rank: null, certificate_url: null, verified: true });
    }
    const activity = r();
    let solved = 0;
    for (let t = 0; t < 6; t++) if (r() < activity && r() < sigmoid(1.5 * thetaTrue)) solved++;
    const fresh = solved > 0 && r() < 0.6;
    const id = `p${seed % 1000}-${persons.length}`;
    const base: CandidateSnapshot = {
      profile: { id, full_name: id, email: `${id}@example.test`, phone: null, telegram: null, city: 'Москва', relocation: false, about: null, specialization: spec,
        standing: flow.passed ? { category: category(spec, gradeOf(flow.assigned)), percentile: modelPercentile(flow.passed.theta), confirmed_at: NOW.toISOString(), test_id: id } : null,
        experience_years: Math.max(0, Math.round(1.5 * resumeGrade + normal(r))), experience: [],
        skills: [...resumeSkills.filter(s => !verified.some(v => v.skill_id === s.skill_id)), ...verified], industries,
        work_formats: formats.length ? formats : ['remote'], salary_expectation: { from, to: Math.round(from * 1.25) }, availability: r() < 0.6 ? 'active' : 'open',
        completeness: Math.round(int(r, 3, 6) / 6 * 100), visibility: 'visible', updated_at: NOW.toISOString() },
      publishedConsent: true, hiddenCompanyIds: [], showFsp: r() < 0.85, achievements: fsp,
      taskSignal: { fresh, solvedCount: solved, lastSolvedAt: solved ? new Date(NOW.getTime() - r() * 60 * 86400000).toISOString() : null },
      standardError: flow.passed?.se ?? null,
    };
    const snapshots: Record<Variant, CandidateSnapshot> = {
      full: base,
      no_test: { ...base, standardError: null, profile: { ...base.profile, skills: resumeSkills,
        standing: { category: category(spec, gradeOf(resumeGrade)), percentile: 50, confirmed_at: NOW.toISOString(), test_id: id } } },
      no_fsp: { ...base, showFsp: false, achievements: [] },
      no_tasks: { ...base, taskSignal: { fresh: false, solvedCount: 0, lastSolvedAt: null } },
    };
    const names = claimed.map(skillName);
    const text = [taxonomy.specializations.find(s => s.id === spec)!.name, taxonomy.grades[resumeGrade - 1]!.name, 'разработчик',
      names.join(', '), inflator ? `Эксперт: ${names.join(', ')}. Глубоко знаю ${names.join(', ')}.` : `Основной стек: ${names.slice(0, 3).join(', ')}.`,
      `Отрасли: ${industries.map(x => taxonomy.industries.find(y => y.id === x)!.name).join(', ')}`, `Опыт ${base.profile.experience_years} лет`].join('\n');
    persons.push({ id, spec, truth: truthLevel, estimate: flow.passed?.theta ?? 0, competence, resumeGrade, snapshots, text, inflator });
  }
  for (const p of persons) {
    const standing = p.snapshots.full.profile.standing;
    if (!standing) continue;
    const cohortRows = persons.filter(q => q.spec === p.spec && q.snapshots.full.profile.standing?.category.grade === standing.category.grade)
      .map(q => ({ candidateId: q.id, theta: q.estimate }));
    standing.percentile = empiricalPercentile(p.estimate, p.id, cohortRows) ?? standing.percentile;
  }
  for (const spec of SPECS) for (let n = 0; n < needsPerSpec; n++) {
    const u = r(), grade = u < 0.2 ? 1 : u < 0.6 ? 2 : u < 0.9 ? 3 : 4, skills = SPEC_SKILLS.get(spec)!;
    const must = sample(r, skills, 2), nice = sample(r, skills, 2, new Set(must));
    const from = Math.round(BASE_SALARY[grade]! * 0.85 * Math.exp(0.1 * normal(r)) / 1000) * 1000;
    const filters: SearchFilters = { specialization: spec, grades: [gradeOf(grade)], must_skills: must, nice_skills: nice, work_formats: FORMATS, city: null,
      include_relocation: false, industries: r() < 0.5 ? [INDUSTRIES[int(r, 0, INDUSTRIES.length - 1)]!] : [], salary: { from, to: Math.round(from * 1.4) },
      fsp_only: false, fsp_level_min: null, availability: ['active', 'open'] };
    const text = [taxonomy.specializations.find(s => s.id === spec)!.name, taxonomy.grades[grade - 1]!.name, ...must.map(skillName), ...nice.map(skillName)].join(' ');
    needs.push({ id: `n${needs.length}`, spec, grade, must, nice, filters, text });
  }
  return { persons, needs, sessions: tested, verifiedPeople };
}

const GOLD = { soft: [0, 0.3, 1, 0.85, 0.6], strict: [0, 0.3, 1, 0.7, 0], lenient: [0, 0.3, 1, 1, 1] } as const;
type Gold = keyof typeof GOLD;
function gold(p: Person, need: Need, kind: Gold) {
  const gap = p.truth - need.grade, gradeFit = gap < -1 ? 0 : GOLD[kind][Math.min(gap, 2) + 2]!;
  const cut = CUTS.cuts[gradeOf(need.grade)] - 0.4;
  const owns = (id: string) => Number((p.competence.get(id) ?? -Infinity) >= cut);
  const u = gradeFit * (0.7 * mean(need.must.map(owns)) + 0.3 * mean(need.nice.map(owns)));
  return u >= 0.75 ? 3 : u >= 0.5 ? 2 : u >= 0.25 ? 1 : 0;
}
const tokens = (text: string) => (text.toLocaleLowerCase('ru').match(/[\p{L}\p{N}][\p{L}\p{N}_+#.-]*/gu) ?? []).filter(w => w.length >= 2);
function bm25(docs: readonly { id: string; text: string }[], query: string, k1 = 1.2, b = 0.75) {
  const parsed = docs.map(d => { const tf = new Map<string, number>(); const words = tokens(d.text); for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1); return { id: d.id, tf, length: words.length }; });
  const df = new Map<string, number>();
  for (const d of parsed) for (const w of d.tf.keys()) df.set(w, (df.get(w) ?? 0) + 1);
  const average = mean(parsed.map(d => d.length)), terms = tokens(query);
  return parsed.map(d => ({ id: d.id, score: terms.reduce((sum, w) => {
    const tf = d.tf.get(w) ?? 0, n = df.get(w) ?? 0;
    return sum + (tf ? Math.log(1 + (parsed.length - n + 0.5) / (n + 0.5)) * tf * (k1 + 1) / (tf + k1 * (1 - b + b * d.length / average)) : 0);
  }, 0) })).sort((x, y) => y.score - x.score || x.id.localeCompare(y.id)).map(x => x.id);
}
const SYSTEMS = ['ours', 'ours_no_test', 'ours_no_fsp', 'ours_no_tasks', 'bm25', 'bm25_filtered', 'eval_rank_text', 'random'] as const;
type System = typeof SYSTEMS[number];
function evaluateWorld(w: ReturnType<typeof world>, label: string) {
  const r = seededRandom(SEED ^ label.length * 0x2f);
  const rows = Object.fromEntries((Object.keys(GOLD) as Gold[]).map(g => [g, Object.fromEntries(SYSTEMS.map(s => [s, [] as { p10: number; ndcg: number; mrr: number }[]]))])) as Record<Gold, Record<System, { p10: number; ndcg: number; mrr: number }[]>>;
  const visibleRelevant: number[] = [], relevantCounts: number[] = [];
  const external = new Map<string, string[]>();
  for (const spec of SPECS) {
    const response = rankExternal({ top_k: K, vacancies: w.needs.filter(n => n.spec === spec).map(n => ({ id: n.id, text: n.text, salary: n.filters.salary })),
      candidates: w.persons.filter(p => p.spec === spec).map(p => ({ id: p.id, text: p.text, grade: gradeOf(p.resumeGrade) })) });
    for (const row of response.results) external.set(row.vacancy_id, row.ranking.map(x => x.candidate_id));
  }
  for (const need of w.needs) {
    const pool = w.persons.filter(p => p.spec === need.spec);
    const ours = (variant: Variant) => pool.filter(p => hardFilters(p.snapshots[variant], need.filters, COMPANY))
      .map(p => ({ id: p.id, score: explain(p.snapshots[variant], need.filters, NOW).score })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).map(x => x.id);
    const full = ours('full'), visible = new Set(full);
    const bm = bm25(pool.map(p => ({ id: p.id, text: p.text })), need.text);
    const rankings: Record<System, string[]> = {
      ours: full, ours_no_test: ours('no_test'), ours_no_fsp: ours('no_fsp'), ours_no_tasks: ours('no_tasks'),
      bm25: bm, bm25_filtered: bm.filter(id => visible.has(id)), eval_rank_text: external.get(need.id)!,
      random: pool.map(p => ({ id: p.id, k: r() })).sort((a, b) => a.k - b.k).map(x => x.id),
    };
    for (const kind of Object.keys(GOLD) as Gold[]) {
      const labels = Object.fromEntries(pool.map(p => [p.id, gold(p, need, kind)]));
      const binary = Object.fromEntries(pool.map(p => [p.id, Number(labels[p.id]! >= 2)]));
      for (const system of SYSTEMS) {
        const top = rankings[system].slice(0, K);
        rows[kind][system].push({ p10: top.filter(id => labels[id]! >= 2).length / K, ndcg: rankingMetrics(top, labels, K).ndcg, mrr: rankingMetrics(top, binary, K).reciprocalRank });
      }
      if (kind !== 'soft') continue;
      const relevant = pool.filter(p => labels[p.id]! >= 2);
      relevantCounts.push(relevant.length);
      if (relevant.length) visibleRelevant.push(relevant.filter(p => visible.has(p.id)).length / relevant.length);
    }
  }
  const n = w.needs.length;
  const summary = (kind: Gold) => Object.fromEntries(SYSTEMS.map(s => [s, Object.fromEntries((['p10', 'ndcg', 'mrr'] as const).map(m => [m === 'p10' ? 'p_at_10' : m === 'ndcg' ? 'ndcg_at_10' : 'mrr_at_10',
    metric(n, idx => mean(idx.map(i => rows[kind][s][i]![m])))]))]));
  const diff = (a: System, b: System, m: 'p10' | 'ndcg') => metric(n, idx => mean(idx.map(i => rows.soft[a][i]![m] - rows.soft[b][i]![m])));
  const pair = (a: System, b: System) => ({ ndcg_at_10: diff(a, b, 'ndcg'), p_at_10: diff(a, b, 'p10') });
  return {
    candidates: w.persons.length, needs: n, test_sessions: w.sessions, people_with_confirmed_grade: w.persons.filter(p => p.snapshots.full.profile.standing).length,
    confirmed_grade_vs_true: Object.fromEntries([-2, -1, 0, 1].map(d => [String(d), w.persons.filter(p => p.snapshots.full.profile.standing && GRADE_ORDER.indexOf(p.snapshots.full.profile.standing.category.grade) + 1 - p.truth === d).length])),
    people_with_test_verified_skills: w.verifiedPeople, mean_relevant_per_need: r4(mean(relevantCounts)), relevant_visible_after_hard_filters: r4(mean(visibleRelevant)),
    systems: summary('soft'),
    other_gold: Object.fromEntries((['strict', 'lenient'] as const).map(g => [g, Object.fromEntries(SYSTEMS.map(s => [s, { ndcg_at_10: r4(mean(rows[g][s].map(x => x.ndcg))), p_at_10: r4(mean(rows[g][s].map(x => x.p10))) }]))])),
    paired_differences: {
      ours_minus_bm25: pair('ours', 'bm25'), ours_minus_bm25_filtered: pair('ours', 'bm25_filtered'),
      full_minus_no_test: pair('ours', 'ours_no_test'), full_minus_no_fsp: pair('ours', 'ours_no_fsp'), full_minus_no_tasks: pair('ours', 'ours_no_tasks'),
    },
  };
}
const matching = {
  gold: 'Метка 0–3 из скрытой истины: соответствие истинного грейда (по θ) грейду потребности × владение must (вес 0.7) и nice (0.3) навыками на уровне не ниже порога грейда − 0.4; пороги метки 0.75/0.5/0.25. Основная (soft): совпал 1, выше на ступень 0.85, на две 0.6, ниже на ступень 0.3. Строгая (strict): выше на ступень 0.7, на две 0. Мягкая к переквалификации (lenient): любой грейд не ниже требуемого 1. Релевантен = метка ≥ 2.',
  dev: evaluateWorld(world(SEED + 1, 250, 30), 'dev'),
  holdout: evaluateWorld(world(SEED + 2, 250, 30), 'holdout'),
};

const report = {
  dataset: 'synthetic', seed: SEED, generated_by: 'npm run eval (backend/eval/validate.ts)', bank_version: LIVE_BANK_VERSION,
  policy: { cat: { min: DEFAULT_POLICY.min, max: DEFAULT_POLICY.max, target_se: DEFAULT_POLICY.targetSe, top_k: DEFAULT_POLICY.topK, max_exposure: DEFAULT_POLICY.maxExposure }, grades: CUTS },
  generator: {
    model: '3PL: P = c + (1 - c) / (1 + exp(-a_true (θ - b_true)))',
    a_true: 'a_bank × U(0.7, 1.3)', b_true: 'b_bank + U(-0.4, 0.4)', c: 0.02,
    realized: { mean_abs_relative_a_shift: r4(mean(LIVE_BANK.map(f => Math.abs(TRUE.get(f.id)!.a / f.a - 1)))), mean_abs_b_shift: r4(mean(LIVE_BANK.map(f => Math.abs(TRUE.get(f.id)!.b - f.b)))) },
    estimator: 'EAP 2PL с экспертными a, b из банка (src/common/irt.ts), без знания a_true, b_true, c',
  },
  assessment, test_retest: retest, bank_leak: bankLeak, exposure: exposureReport, matching,
  limitations: [
    'Все кандидаты, ответы и потребности синтетические; это проверка устойчивости алгоритмов, а не эмпирическая валидность на людях.',
    'Истинные параметры заданий отличаются от экспертных случайным шумом, но форма модели (логистическая, одномерная в части 1) близка к модели оценщика.',
    'Золотая релевантность задана правилом авторов отчёта; другое правило даст другие абсолютные цифры.',
    'Практический блок с кодом и вопрос о подходе не моделируются: в симуляции practiceTotal = 0, как при отключённой песочнице.',
  ],
};
writeFileSync(process.env.EVAL_OUT ?? new URL('./validation-report.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
const v = (m: { value: number }) => m.value;
console.log(JSON.stringify({
  grade_exact: v(assessment.grade_by_theta.exact), kappa: v(assessment.grade_by_theta.quadratic_kappa), r: v(assessment.grade_by_theta.pearson_theta),
  false_reject: v(assessment.confirmation_decision.false_reject_rate), retest_kappa: v(retest.quadratic_kappa), exposure_max: exposureReport.max_rate,
  holdout_ndcg: { ours: v(matching.holdout.systems.ours!.ndcg_at_10!), bm25: v(matching.holdout.systems.bm25!.ndcg_at_10!) },
  seconds: Math.round((performance.now() - started) / 100) / 10,
}));
