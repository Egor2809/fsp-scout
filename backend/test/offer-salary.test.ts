import test from 'node:test';
import assert from 'node:assert/strict';
import { offerSpreadOk } from '../src/common/invitation-state.ts';

test('offer salary range must be real: ordered and no wider than 1.6x', () => {
  assert.equal(offerSpreadOk({ from: 200000, to: 320000 }), true);
  assert.equal(offerSpreadOk({ from: 200000, to: 320001 }), false);
  assert.equal(offerSpreadOk({ from: 300000, to: 200000 }), false);
});
