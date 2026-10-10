import test from 'node:test';
import assert from 'node:assert/strict';
import { SharedProbe } from '../src/common/shared-probe.ts';

test('probe deadline does not allow concurrent replacement until underlying I/O settles', async () => {
  const probe = new SharedProbe<number>();
  let calls = 0, resolve!: (value: number) => void;
  const operation = () => { calls++; return new Promise<number>(r => { resolve = r; }); };
  const first = probe.run(operation, 5);
  assert.equal(probe.run(operation, 5), first);
  await assert.rejects(first, /timeout/);
  assert.equal(probe.run(operation, 5), first);
  assert.equal(calls, 1);
  resolve(1);
  await new Promise<void>(done => setImmediate(done));
  const recovered = probe.run(async () => { calls++; return 2; }, 100);
  assert.equal(await recovered, 2);
  assert.equal(calls, 2);
});
