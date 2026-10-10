import test from 'node:test';
import assert from 'node:assert/strict';
import { Capacity } from '../src/common/capacity.ts';
test('capacity refuses excess resources and duplicate release cannot admit extra work', () => {
  const gate = new Capacity(2);
  const first = gate.acquire(), second = gate.acquire();
  assert.ok(first && second);
  assert.equal(gate.acquire(), null);
  first(); first();
  const third = gate.acquire();
  assert.ok(third);
  assert.equal(gate.acquire(), null);
  second(); third();
  assert.ok(gate.acquire());
  assert.ok(gate.acquire());
  assert.equal(gate.acquire(), null);
  assert.throws(() => new Capacity(0));
});
