import { test } from 'node:test';
import assert from 'node:assert/strict';
import { card, ownProfile, snapshot, type CandidateRow } from '../src/matching/candidate-mapper.ts';

function row(): CandidateRow {
  return {
    id: 'candidate', userId: 'user', user: { id: 'user', subject: 'subject', email: 'ivan@example.test', displayName: 'Иван Петров', role: 'candidate', createdAt: new Date() },
    surveyCompleted: true, specialization: 'frontend', confirmedSpecialization: 'backend', grade: 'middle', theta: 0.5, standardError: 0.3,
    gradeChangedAt: new Date(), updatedAt: new Date(), lastActiveAt: new Date(), salaryFloor: 240000, privacy: { show_company_names: false, show_city: false },
    profile: { full_name: 'Иван Петров', phone: '+79991234567', telegram: '@private_ivan', city: 'Москва', standing: { category: { specialization: 'frontend', grade: 'lead', label: 'Forged stale label' }, percentile: 80, confirmed_at: new Date().toISOString(), test_id: 'test' },
      experience: [{ role: 'Разработчик', company_name: 'ООО Секрет', company_hidden: false, industry: 'fintech', start: '2023-01', end: null, description: 'Иван Петров в ООО Секрет, ivan@example.test, +79991234567. Go PostgreSQL.' }], skills: [], industries: [], work_formats: ['remote'], availability: 'active' },
    consents: [{ id: 'consent', candidateId: 'candidate', type: 'profile_visibility', version: '2026-09', givenAt: new Date(), revokedAt: null }],
  } as unknown as CandidateRow;
}
test('card respects authoritative confirmed category and removes identity from free text', () => {
  const c = row();
  assert.equal(ownProfile(c).standing?.category.label, 'Backend · Middle');
  const result = card(c, 'company', new Date(), null, { invitation: null, application: null });
  assert.equal(result.contacts, null);
  assert.equal(result.city, null);
  assert.equal(result.experience[0]!.company_name, null);
  for (const value of ['Иван', 'Петров', 'ООО Секрет', 'ivan@example.test', '79991234567', '@private_ivan']) assert.ok(!JSON.stringify(result).includes(value));
  assert.match(result.experience[0]!.description!, /Go PostgreSQL/);
});
test('disclosure reveals contacts only in a company view, never in preview', () => {
  const c = row(), disclosure = { reason: 'invitation_accepted', at: new Date(), sourceId: 'invitation' };
  assert.equal(card(c, null, new Date(), disclosure, { invitation: null, application: null }).contacts, null);
  assert.equal(card(c, 'company', new Date(), disclosure, { invitation: null, application: null }).contacts?.email, 'ivan@example.test');
});
test('cached task badge expires on read without waiting for another review', () => {
  const c = row(), now = new Date('2026-10-10T12:00:00Z');
  (c.profile as Record<string, unknown>).task_signal = { fresh: true, solved_count: 2, last_solved_at: '2026-09-10T12:00:00Z' };
  assert.equal(snapshot(c, now).taskSignal.fresh, false);
  assert.equal(snapshot(c, now).taskSignal.solvedCount, 2);
  (c.profile as Record<string, unknown>).task_signal = { fresh: true, solved_count: 2, last_solved_at: '2026-10-09T12:00:00Z' };
  assert.equal(snapshot(c, now).taskSignal.fresh, true);
});
