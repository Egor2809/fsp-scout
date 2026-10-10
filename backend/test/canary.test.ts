import test from 'node:test';
import assert from 'node:assert/strict';
import { LIVE_BANK, LIVE_BANK_VERSION, instantiate } from '../src/assessment/live-bank.ts';
import { canaryFlags, canaryTimingModels, canaryStandingFlags, type CanaryResponse, type TimingObservation, type TimingScope } from '../src/assessment/canary-flags.ts';
import { gradeAnswer } from '../src/assessment/grading.ts';
import { scoreCompletion } from '../src/assessment/completion.ts';

const model = { familyId: 'c', sampleSize: 30, logMean: Math.log(60000), logSd: 0.5 };
const pattern: CanaryResponse[] = [
  { familyId: 'a', ordinal: 1, canary: false, correct: false, serverElapsedMs: 60000 },
  { familyId: 'c', ordinal: 2, canary: true, correct: true, serverElapsedMs: 1000 },
  { familyId: 'b', ordinal: 3, canary: false, correct: false, serverElapsedMs: 60000 },
];

test('a fast correct canary between two wrong ordinary answers emits one warning', () => {
  const saved = structuredClone(pattern);
  const flags = canaryFlags([...pattern].reverse(), [model]);
  assert.deepEqual(flags.map(f => [f.code, f.severity]), [['leak_suspected', 'warning']]);
  assert.deepEqual(pattern, saved);
  assert.equal(canaryFlags([...pattern, ...pattern.map(p => ({ ...p, ordinal: p.ordinal + 3, familyId: p.familyId + '2' }))],
    [model, { ...model, familyId: 'c2' }]).length, 1);
});

test('all three observations, ordinary neighbours, correct canary and real timing norm are required', () => {
  assert.deepEqual(canaryFlags(pattern, []), []);
  for (const index of [0, 1, 2]) {
    assert.deepEqual(canaryFlags(pattern.filter((_, i) => i !== index), [model]), []);
    for (const correct of [null, index === 1 ? false : true]) {
      assert.deepEqual(canaryFlags(pattern.map((p, i) => i === index ? { ...p, correct } : p), [model]), []);
    }
    assert.deepEqual(canaryFlags(pattern.map((p, i) => i === index ? { ...p, serverElapsedMs: 0 } : p), [model]), []);
  }
  for (const index of [0, 2]) assert.deepEqual(canaryFlags(pattern.map((p, i) => i === index ? { ...p, canary: true } : p), [model]), []);
  assert.deepEqual(canaryFlags(pattern.map(p => ({ ...p, canary: false })), [model]), []);
  assert.deepEqual(canaryFlags(pattern.map(p => p.ordinal === 3 ? { ...p, ordinal: 4 } : p), [model]), []);
  assert.deepEqual(canaryFlags(pattern.map(p => p.canary ? { ...p, serverElapsedMs: 60000 } : p), [model]), []);
});

test('canary timing boundary is strict and malformed evidence cannot produce a warning', () => {
  const boundary = { ...model, logMean: 2.5, logSd: 1 };
  const responses = pattern.map(p => p.canary ? { ...p, serverElapsedMs: 1 } : p);
  assert.deepEqual(canaryFlags(responses, [boundary]), []);
  assert.equal(canaryFlags(responses, [{ ...boundary, logMean: 2.5001 }])[0]?.code, 'leak_suspected');
  for (const serverElapsedMs of [-1, Infinity, NaN]) assert.throws(() => canaryFlags([{ ...pattern[0]!, serverElapsedMs }], [model]), RangeError);
  assert.throws(() => canaryFlags([pattern[0]!, pattern[0]!], [model]), RangeError);
  assert.throws(() => canaryFlags(pattern, [model, model]), RangeError);
  for (const invalid of [{ sampleSize: 29 }, { logSd: 0 }, { logMean: NaN }]) assert.throws(() => canaryFlags(pattern, [{ ...model, ...invalid }]), RangeError);
});

const at = new Date('2026-10-11T12:00:00Z');
const scope: TimingScope = { candidateId: 'current', bankVersion: 'v6', specialization: 'backend', declaredGrade: 'middle', express: false,
  at, families: [{ familyId: 'c', templateVersion: 1 }] };
const samples: TimingObservation[] = Array.from({ length: 35 }, (_, index) => ({ id: String(index), candidateId: `person-${index}`,
  familyId: 'c', templateVersion: 1, bankVersion: 'v6', specialization: 'backend', declaredGrade: 'middle', express: false, correct: true,
  issuedAt: new Date(at.getTime() - 200000), answeredAt: new Date(at.getTime() - 200000 + 30000 + index * 2000), finishedAt: at }));

test('timing norms need 30 independent candidates and exclude self and incompatible observations', () => {
  assert.equal(canaryTimingModels(samples, scope)[0]?.sampleSize, 35);
  assert.deepEqual(canaryTimingModels(samples.slice(0, 29), scope), []);
  assert.deepEqual(canaryTimingModels(samples.map(p => ({ ...p, candidateId: 'one-person' })), scope), []);
  const incompatible: Partial<TimingObservation>[] = [{ candidateId: 'current' }, { bankVersion: 'v5' }, { specialization: 'qa' },
    { declaredGrade: 'lead' }, { express: true }, { templateVersion: 2 }, { familyId: 'ordinary' }, { correct: false }, { correct: null },
    { answeredAt: null }, { finishedAt: null }, { finishedAt: new Date(at.getTime() + 1) },
    { answeredAt: new Date(at.getTime() + 1) }, { issuedAt: at }, { issuedAt: new Date(NaN) }];
  for (const patch of incompatible) assert.deepEqual(canaryTimingModels(samples.map(p => ({ ...p, ...patch })), scope), []);
  assert.deepEqual(canaryTimingModels(samples.map(p => ({ ...p, answeredAt: new Date(p.issuedAt.getTime() + 10000) })), scope), []);
});

test('retries cannot inflate timing samples and input order does not change the selected observations', () => {
  const newer = samples.map(p => ({ ...p, id: `new-${p.id}`, answeredAt: new Date(p.answeredAt!.getTime() + 10000) }));
  const combined = [...samples, ...newer];
  assert.deepEqual(canaryTimingModels(combined, scope), canaryTimingModels(newer, scope));
  assert.deepEqual(canaryTimingModels(combined.reverse(), scope), canaryTimingModels(newer, scope));
  const many = Array.from({ length: 300 }, (_, i) => ({ ...samples[i % samples.length]!, id: `id-${i}`, candidateId: `candidate-${i}` }));
  assert.equal(canaryTimingModels(many, scope)[0]?.sampleSize, 200);
});

test('each specialization has two varied canaries with private markers and no public answer key', () => {
  for (const spec of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    const families = LIVE_BANK.filter(f => f.canary && f.specializations.includes(spec));
    assert.equal(families.length, 2, spec);
    for (const family of families) {
      const prompts = new Set<string>(), keys = new Set<number>();
      for (let seed = 0; seed < 100; seed++) {
        const item = instantiate(family, seed, 'fixture', 1);
        assert.equal(item.parameters.canary, 1);
        assert.equal(item.parameters.irt_c, 0);
        assert.ok(!/canary|канаре|expectedAnswer|correctIds/i.test(JSON.stringify(item.publicItem)));
        if (item.expectedAnswer.kind !== 'numeric') throw new Error('Expected numeric canary');
        prompts.add(item.publicItem.prompt); keys.add(item.expectedAnswer.value);
        assert.deepEqual(gradeAnswer(item.publicItem, item.expectedAnswer, { text: String(item.expectedAnswer.value) }), { status: 'evaluated', correct: true });
        assert.deepEqual(gradeAnswer(item.publicItem, item.expectedAnswer, { text: String(item.expectedAnswer.value + 1) }), { status: 'evaluated', correct: false });
        assert.deepEqual(item, instantiate(family, seed, 'fixture', 1));
      }
      assert.ok(prompts.size > 90, family.id);
      assert.ok(keys.size > 80, family.id);
    }
  }
  assert.equal(LIVE_BANK_VERSION, 'expert-bank-20261010-v6');
  const ordinary = LIVE_BANK.find(f => !f.canary)!;
  assert.ok(!('canary' in instantiate(ordinary, 1, 'fixture', 1).parameters));
});

test('queue and retry keys agree with independently simulated executions', () => {
  for (let seed = 0; seed < 20; seed++) {
    const queue = LIVE_BANK.find(f => f.id === 'canary-backend-queue')!.generate(seed);
    const { jobs, workers, duration } = queue.parameters;
    const busyUntil = Array.from({ length: workers! }, () => 0);
    for (let job = 0; job < jobs!; job++) {
      const first = busyUntil.indexOf(Math.min(...busyUntil));
      busyUntil[first] = busyUntil[first]! + duration!;
    }
    assert.equal(queue.value, Math.max(...busyUntil));
    const retry = LIVE_BANK.find(f => f.id === 'canary-qa-retries')!.generate(seed);
    let attempts = 0;
    for (let item = 0; item < retry.parameters.cases!; item++) {
      attempts++;
      if (item < retry.parameters.failed!) for (let count = 0; count < retry.parameters.retries!; count++) attempts++;
    }
    assert.equal(retry.value, attempts);
  }
});

test('a canary warning neither changes the score nor mutates saved item evidence', () => {
  const family = LIVE_BANK.find(f => f.canary)!;
  const item = { ...instantiate(family, 17, 'fixture', 1), id: 'fixture', ordinal: 1, block: 'adaptive',
    competency: family.competency, correct: true, answeredAt: at };
  const policy = { min: 1, max: 1, targetSe: 0.4, topK: 3, maxExposure: 0.4, practiceTotal: 0, approachTotal: 0 };
  const cuts = { version: 'fixture', cuts: { junior: -1.2, middle: -0.4, senior: 0.4, lead: 1.2 }, passProbability: 0.6 };
  const before = scoreCompletion([item], policy, 'middle', cuts);
  assert.equal(canaryFlags(pattern, [model])[0]?.code, 'leak_suspected');
  const after = scoreCompletion([item], policy, 'middle', cuts);
  assert.deepEqual(after, before);
  assert.deepEqual(scoreCompletion([{ ...item, parameters: { ...item.parameters, canary: 0 } }], policy, 'middle', cuts), before);
});

test('standing retains the warning without duplicating it or changing existing flags', () => {
  const previous = [{ code: 'paste' as const, severity: 'info' as const }];
  const saved = structuredClone(previous), warnings = canaryFlags(pattern, [model]);
  const flags = canaryStandingFlags(previous, warnings);
  assert.deepEqual(flags, [...previous, { code: 'leak_suspected', severity: 'warning' }]);
  assert.deepEqual(canaryStandingFlags(flags, warnings), flags);
  assert.deepEqual(canaryStandingFlags(previous, []), previous);
  assert.deepEqual(previous, saved);
});
