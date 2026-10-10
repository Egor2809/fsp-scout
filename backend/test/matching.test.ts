import { test } from 'node:test';
import assert from 'node:assert/strict';
import { category, explain, hardFilters, percentileReliability, radar, searchGrades, strength, type CandidateSnapshot } from '../src/matching/matching.ts';
import { parseNeed, parseSalary } from '../src/needs/need-parser.ts';
import type { FspAchievement, SearchFilters } from '../src/contract/model/index.js';

const now = new Date('2026-10-10T00:00:00Z');
const filters: SearchFilters = { specialization: 'backend', grades: ['middle'], must_skills: ['go', 'postgresql'], nice_skills: ['kafka'], work_formats: ['remote'], city: 'Москва', include_relocation: false, industries: ['fintech'], salary: { from: 250000, to: 320000 }, fsp_only: false, fsp_level_min: null, availability: ['active', 'open'] };
function candidate(): CandidateSnapshot {
  return { profile: { id: 'c', full_name: 'Private Name', email: 'private@example.test', phone: null, telegram: null, city: 'Казань', relocation: false, about: null,
    specialization: 'frontend', // Declared profile cannot override the confirmed category.
    standing: { category: category('backend', 'middle'), percentile: 85, confirmed_at: now.toISOString(), test_id: 't' }, experience_years: 3, experience: [],
    skills: ['go', 'postgresql'].map(id => ({ skill_id: id, name: id, level: 'confident', source: 'test', verified: true, score: 85 })), industries: ['fintech'], work_formats: ['remote'], salary_expectation: { from: 250000, to: 300000 }, availability: 'active', completeness: 70, visibility: 'visible', updated_at: now.toISOString() },
    publishedConsent: true, hiddenCompanyIds: [], showFsp: true, achievements: [], taskSignal: { fresh: false, solvedCount: 0, lastSolvedAt: null }, standardError: 0.3 };
}
test('confirmation, publication consent and company privacy are hard requirements', () => {
  const c = candidate();
  assert.ok(hardFilters(c, filters, 'company'));
  c.publishedConsent = false;
  assert.equal(hardFilters(c, filters, 'company'), false);
  c.publishedConsent = true; c.hiddenCompanyIds.push('company');
  assert.equal(hardFilters(c, filters, 'company'), false);
  c.hiddenCompanyIds = []; c.profile.standing = null;
  assert.equal(hardFilters(c, filters, 'company'), false);
});
test('one lower grade is visible with an explicit penalty; other hard filters remain mandatory', () => {
  const c = candidate();
  const exact = explain(c, filters, now);
  c.profile.standing!.category = category('backend', 'junior');
  assert.ok(hardFilters(c, filters, 'company'));
  const lower = explain(c, filters, now);
  assert.equal(lower.score, exact.score - 8);
  assert.ok(lower.chips.some(f => f.contribution === -8 && f.polarity === 'negative'));
  assert.ok(Math.abs(lower.factors.reduce((sum, f) => sum + f.contribution, 0) - lower.score) < 1e-8);
  assert.equal(hardFilters(c, { ...filters, grades: ['senior'] }, 'company'), false);
  assert.equal(hardFilters(c, { ...filters, grades: [] }, 'company'), false);
  c.profile.standing!.category = category('frontend', 'junior');
  assert.equal(hardFilters(c, filters, 'company'), false);
  c.profile.standing!.category = category('backend', 'junior');
  c.profile.skills = [];
  assert.equal(hardFilters(c, filters, 'company'), false);
  c.profile.skills = candidate().profile.skills;
  c.publishedConsent = false;
  assert.equal(hardFilters(c, filters, 'company'), false);
});
test('exact grade wins over adjacent selections and higher grades are not silently admitted', () => {
  const c = candidate();
  assert.equal(explain(c, { ...filters, grades: ['middle', 'senior'] }, now).score, explain(c, filters, now).score);
  c.profile.standing!.category = category('backend', 'senior');
  assert.equal(hardFilters(c, filters, 'company'), false);
});
test('database shortlist includes the adjacent lower grade and matches the final admission rule', () => {
  assert.deepEqual(searchGrades(['middle']), ['junior', 'middle']);
  assert.deepEqual(searchGrades(['junior']), ['junior']);
  assert.deepEqual(searchGrades(['lead']), ['senior', 'lead']);
  assert.deepEqual(searchGrades(['middle', 'lead']), ['junior', 'middle', 'senior', 'lead']);
  assert.deepEqual(searchGrades([]), []);
  for (const grade of ['junior', 'middle', 'senior', 'lead'] as const) {
    const c = candidate();
    c.profile.standing!.category = category('backend', grade);
    assert.equal(searchGrades(filters.grades).includes(grade), hardFilters(c, filters, 'company'));
  }
});
test('explanations sum to score and never include personal identity', () => {
  const c = candidate(), result = explain(c, filters, now);
  assert.ok(Math.abs(result.factors.reduce((sum, f) => sum + f.contribution, 0) - result.score) < 1e-8);
  assert.equal(result.chips.length, 3);
  assert.ok(!JSON.stringify(result).includes('Private Name'));
  assert.ok(!JSON.stringify(result).includes('private@example.test'));
  const missing = result.factors.find(f => f.kind === 'missing_skill')!;
  assert.equal(missing.contribution, 0);
  assert.match(result.factors.find(f => f.kind === 'semantic')!.evidence!, /Jaccard/);
});
test('FSP is a verified positive bonus and absence has no standalone penalty', () => {
  const c = candidate(), base = strength(c, now).total;
  const achievement: FspAchievement = { id: 'a', event_id: 'e', title: 'Тестовое соревнование', date: '2026-09-01', level: 'national', discipline: 'product', format: 'team', team: null, role: null, place: 1, participants_total: 100, percentile: 99, result: 'winner', sport_rank: null, certificate_url: null, verified: false };
  c.achievements = [achievement];
  assert.equal(strength(c, now).total, base);
  achievement.verified = true;
  assert.ok(strength(c, now).total > base);
  c.showFsp = false;
  assert.equal(strength(c, now).total, base);
});
test('percentile weight shrinks with test standard error', () => {
  const precise = candidate(), noisy = candidate();
  precise.standardError = 0.1; noisy.standardError = 0.6;
  assert.ok(percentileReliability(0.1) > percentileReliability(0.6));
  assert.equal(percentileReliability(null), 0);
  assert.ok(strength(precise, now).total > strength(noisy, now).total);
  assert.equal(strength(noisy, now).percentile, 85);
});
test('radar partitions salary expectations and handles an empty category', () => {
  const cat = category('backend', 'middle');
  assert.equal(radar([], cat, filters.salary).median, null);
  const candidates = [candidate(), candidate(), candidate()];
  candidates[1]!.profile.salary_expectation = { from: 350000, to: 400000 };
  candidates[2]!.profile.salary_expectation = { from: 150000, to: 200000 };
  const result = radar(candidates, cat, filters.salary);
  assert.equal(result.candidates_total, 3);
  assert.equal(result.histogram.reduce((sum, b) => sum + b.count, 0), 3);
  assert.ok(Math.abs(result.share_above + result.share_below + result.share_within - 1) < 0.02);
});
test('need parser extracts salary and splits mandatory/optional skills', () => {
  const result = parseNeed('Ищем бэкенд-разработчика middle на Go в платёжный сервис: PostgreSQL обязательно, желательно Kafka и k8s. Гибрид в Москве или удалёнка, 250–320 тысяч на руки.');
  assert.equal(result.specialization, 'backend');
  assert.equal(result.grade, 'middle');
  assert.deepEqual(result.salary, { from: 250000, to: 320000 });
  assert.ok(result.must_skills.some(s => s.id === 'postgresql'));
  assert.ok(result.nice_skills.some(s => s.id === 'kubernetes'));
  assert.equal(parseSalary('опыт 3-5 лет'), null);
});
