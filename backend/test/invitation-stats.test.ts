import { test } from 'node:test';
import assert from 'node:assert/strict';
import { invitationStats, type StatsInvitation } from '../src/common/invitation-stats.ts';
const sentAt = new Date('2026-10-01T00:00:00Z');
const event = (status: string, hours: number, actor = 'candidate') => ({ status, at: new Date(sentAt.getTime() + hours * 3600000), actor });
test('funnel counts distinct reached stages and median uses first decision with even midpoint', () => {
  const rows: StatsInvitation[] = [
    { sentAt, viewedAt: null, response: { decision: 'accepted' }, events: [event('postponed', 2), event('accepted', 10), event('interview', 20, 'employer'), event('offer', 30, 'employer'), event('hired', 40, 'employer')] },
    { sentAt, viewedAt: null, response: { decision: 'declined', reason: 'salary' }, events: [event('declined', 4)] },
    { sentAt, viewedAt: null, response: null, events: [event('expired', 100, 'system')] },
  ];
  const stats = invitationStats(rows, 90);
  assert.equal(stats.funnel.sent, 3);
  assert.equal(stats.funnel.viewed, 2);
  assert.equal(stats.funnel.accepted, 1);
  assert.equal(stats.funnel.hired, 1);
  assert.equal(stats.funnel.postponed, 1);
  assert.equal(stats.acceptance_rate, 0.5);
  assert.equal(stats.median_response_hours, 3);
  assert.deepEqual(stats.decline_reasons, [{ reason: 'salary', count: 1 }]);
});
test('empty cohort has zero rate and null median, without fictional observations', () => {
  const stats = invitationStats([], 7);
  assert.equal(stats.acceptance_rate, 0);
  assert.equal(stats.median_response_hours, null);
  assert.deepEqual(stats.decline_reasons, []);
});
