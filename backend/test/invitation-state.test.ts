import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transition, quotaPeriod, InvalidInvitationTransition } from '../src/common/invitation-state.ts';

const now = new Date('2026-10-09T12:00:00Z');
const sent = { status: 'sent' as const, expiresAt: new Date('2026-10-10T12:00:00Z'), postponedOnce: false };
test('only candidate acceptance starts employer follow-up', () => {
  assert.throws(() => transition(sent, 'accepted', 'employer', now), InvalidInvitationTransition);
  const accepted = transition(sent, 'accepted', 'candidate', now);
  const interview = transition(accepted, 'interview', 'employer', now);
  const offer = transition(interview, 'offer', 'employer', now);
  assert.equal(transition(offer, 'hired', 'employer', now).status, 'hired');
  assert.throws(() => transition(accepted, 'declined', 'candidate', now), InvalidInvitationTransition);
});
test('postponement is one-time and expiry wins at the deadline', () => {
  const postponed = transition(sent, 'postponed', 'candidate', now);
  assert.ok(postponed.postponedOnce);
  assert.throws(() => transition(postponed, 'postponed', 'candidate', now), InvalidInvitationTransition);
  assert.throws(() => transition(sent, 'accepted', 'candidate', sent.expiresAt), InvalidInvitationTransition);
  assert.equal(transition(sent, 'expired', 'system', sent.expiresAt).status, 'expired');
});
test('weekly quota resets at Monday Moscow midnight', () => {
  const before = quotaPeriod(new Date('2026-10-11T20:59:59Z'));
  const after = quotaPeriod(new Date('2026-10-11T21:00:00Z'));
  assert.equal(before.start.toISOString(), '2026-10-04T21:00:00.000Z');
  assert.equal(after.start.toISOString(), '2026-10-11T21:00:00.000Z');
  assert.equal(before.end.toISOString(), after.start.toISOString());
});
