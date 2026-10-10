import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessmentMode, fullAttempts, confirmsCategory, validatePolicy, DEFAULT_POLICY } from '../src/assessment/session-state.ts';
import { LIVE_BANK, requiredCompetencies } from '../src/assessment/live-bank.ts';
import { selectWithWaiver, seededRandom, type CatState } from '../src/common/cat.ts';
import { completionReadiness, type CompletionItem } from '../src/assessment/completion.ts';

test('express requires explicit opt-in and snapshots a short policy without practice', () => {
  for (const setting of [undefined, '', 'false', 'TRUE', '1']) {
    const full = assessmentMode(setting);
    assert.equal(full.policy.express, false);
    assert.equal(full.policy.min, DEFAULT_POLICY.min);
    assert.equal(full.policy.max, DEFAULT_POLICY.max);
    assert.equal(full.timeLimitSec, 2400);
  }
  const demo = assessmentMode('true');
  assert.deepEqual([demo.policy.min, demo.policy.max, demo.policy.practiceTotal, demo.policy.approachTotal, demo.timeLimitSec], [5, 6, 0, 0, 600]);
  validatePolicy(demo.policy);
  demo.policy.min = 1;
  assert.equal(assessmentMode('true').policy.min, 5);
  assert.equal(DEFAULT_POLICY.min, 8);
});

test('express attempts cannot confirm a category or consume full-test retake history', () => {
  for (const passed of [false, true]) for (const allowed of [false, true]) {
    assert.equal(confirmsCategory(assessmentMode('true').policy, passed, allowed), false);
    assert.equal(confirmsCategory(assessmentMode().policy, passed, allowed), passed && allowed);
  }
  const full = { id: 'full', policy: { express: false } }, legacy = { id: 'legacy', policy: {} }, demo = { id: 'demo', policy: { express: true } };
  assert.deepEqual(fullAttempts([demo, full, legacy]), [full, legacy]);
});

test('express CAT finishes within 5–6 questions with real-bank coverage for every specialization', () => {
  for (const spec of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    const bank = LIVE_BANK.filter(f => f.specializations.includes(spec));
    for (let seed = 0; seed < 20; seed++) {
      const base = assessmentMode('true').policy;
      const required = requiredCompetencies(bank, base.maxExposure);
      const policy = { ...base, requiredCompetencies: required };
      const state: CatState = { responses: [], servedIds: [], competencyCounts: {} };
      const items: CompletionItem[] = [];
      const random = seededRandom(seed);
      for (let i = 0; i <= policy.max; i++) {
        const selected = selectWithWaiver(bank, state, policy, {}, required, random);
        if (!selected.family) {
          assert.ok(['precision', 'max_length'].includes(selected.reason), `${spec}: ${selected.reason}`);
          break;
        }
        const f = selected.family, correct = seed % 3 === 0 || (seed % 3 === 1 && i % 2 === 0);
        state.responses.push({ a: f.a, b: f.b, correct });
        state.servedIds.push(f.id);
        state.competencyCounts[f.competency] = (state.competencyCounts[f.competency] ?? 0) + 1;
        items.push({ id: f.id, ordinal: i + 1, block: 'adaptive', answeredAt: new Date(0), correct, competency: f.competency, discrimination: f.a, difficulty: f.b });
      }
      assert.ok(items.length >= 5 && items.length <= 6, spec);
      assert.equal(completionReadiness(items, policy), 'ready', spec);
    }
  }
});
