import test from 'node:test';
import assert from 'node:assert/strict';
import { fitTimingModel, telemetryFlags } from '../src/assessment/telemetry-flags.ts';
const response = { familyId: 'f', correct: true, difficulty: 1, serverElapsedMs: 1000, pasteCount: 0, focusLostCount: 0 };
const model = { familyId: 'f', sampleSize: 30, logMean: Math.log(60000), logSd: 0.5 };
const second = { ...response, familyId: 'g' };
const models = [model, { ...model, familyId: 'g' }];
test('fast-correct flag requires real timing model, difficult correct answers and repeated observations', () => {
  assert.deepEqual(telemetryFlags([response, second], 0, []), []);
  assert.deepEqual(telemetryFlags([response], 0, [model]), []);
  assert.deepEqual(telemetryFlags([{ ...response, correct: false }, second], 0, models), []);
  assert.deepEqual(telemetryFlags([response, second], 2, models), []);
  assert.equal(telemetryFlags([response, second], 0, models)[0].code, 'fast_correct');
  assert.throws(() => telemetryFlags([response, response], 0, models));
});
test('browser events are informational and model fitting refuses insufficient or degenerate data', () => {
  const flags = telemetryFlags([{ ...response, pasteCount: 2, focusLostCount: 3 }], 0, []);
  assert.deepEqual(flags.map(f => [f.code, f.severity]), [['paste', 'info'], ['focus_loss', 'info']]);
  assert.equal(fitTimingModel('f', [1000, 2000]), null);
  assert.equal(fitTimingModel('f', Array(30).fill(1000)), null);
  const fitted = fitTimingModel('f', Array.from({ length: 30 }, (_, i) => 1000 + i * 1000));
  assert.ok(fitted && fitted.logSd > 0.05 && fitted.sampleSize === 30);
  assert.throws(() => fitTimingModel('f', [0]));
  assert.throws(() => telemetryFlags([response], 0, [{ ...model, sampleSize: 2 }]));
  assert.throws(() => telemetryFlags([{ ...response, pasteCount: -1 }], 0, []));
});
