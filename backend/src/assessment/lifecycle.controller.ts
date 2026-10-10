import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { StartTestBody } from '../contract/schemas.js';
import type { Grade, Specialization, TestItem, TestOutcome, TestBlueprint } from '../contract/model/index.js';
import { vacancyBlueprint } from './vacancy-blueprint.js';
import { parse } from '../common/validation.js';
import { Problem } from '../common/problem.js';
import { eligibility, exceptionParent, type RetakeState } from '../common/retake.js';
import { selectWithWaiver, seededRandom, type CatState } from '../common/cat.js';
import { LIVE_BANK, LIVE_BANK_VERSION, bankInventory, instantiate, requiredCompetencies } from './live-bank.js';
import { assessmentMode, fullAttempts, coveredCompetencies, currentItem, DEFAULT_GRADE_POLICY, DEFAULT_POLICY, exposure, progress, validatePolicy, type IssuedItem, type SessionPolicy } from './session-state.js';
import { validateGradeCuts, type GradeCuts } from './result-scoring.js';
import { PRACTICE_BANK, PRACTICE_BANK_VERSION, instantiatePractice, selectPracticeFamily } from './practice-bank.js';
import { CODE_JOB_TOPIC } from './code-job.js';
import { SKILL_CONFIRMATION_POLICY } from './confirmed-skills.js';
import { runtimeAvailable } from './piston.js';
import { itemResponse } from './item-response.js';

@Controller('tests')
@UseGuards(AuthGuard)
export class AssessmentLifecycleController {
  constructor(private readonly db: Database) {}
  private async candidate(identity: Identity) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const c = await this.db.candidate.findFirst({ where: { user: { subject: identity.sub } } });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    return c;
  }
  @Post()
  async start(@Req() req: { identity: Identity }, @Body() body: unknown) {
    const d = parse(StartTestBody, body), c = await this.candidate(req.identity);
    const mode = assessmentMode(process.env.ASSESSMENT_EXPRESS === 'true' && d.express === true ? 'true' : undefined);
    // Expiry is committed independently of later validation failures.
    await this.db.testSession.updateMany({ where: { candidateId: c.id, status: 'in_progress', deadlineAt: { lte: new Date() } }, data: { status: 'expired', finishedAt: new Date() } });
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: c.id } });
      if (!fresh.surveyCompleted) throw new Problem(409, 'survey_required', 'Сначала пройдите опрос');
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const active = await tx.testSession.findFirst({ where: { candidateId: c.id, status: 'in_progress' }, select: { id: true } });
      if (active) throw new Problem(409, 'test_in_progress', 'Сначала завершите начатый тест');
      const specialization = (d.specialization ?? fresh.specialization) as Specialization | null;
      if (!specialization) throw new Problem(409, 'survey_required', 'В опросе не выбрана специализация');
      const history = await tx.testSession.findMany({ where: { candidateId: c.id, specialization } });
      const p = fresh.profile as Prisma.JsonObject;
      const state: RetakeState = { surveyCompleted: true, activeTestId: null, currentGrade: fresh.confirmedSpecialization === specialization ? fresh.grade as Grade | null : null,
        lastGradeChangeAt: fresh.gradeChangedAt, experienceYears: typeof p.experience_years === 'number' ? p.experience_years : null,
        attempts: fullAttempts(history).map(t => ({ id: t.id, grade: t.declaredGrade as Grade, startedAt: t.startedAt, finishedAt: t.finishedAt, exceptionParentId: t.exceptionParentId,
          outcome: ((t.result as Prisma.JsonObject | null)?.outcome ?? null) as TestOutcome | null })) };
      const now = new Date(), allowed = eligibility(state, now).find(g => g.grade === d.declared_grade)!;
      if (!mode.policy.express && !allowed.can_start) throw new Problem(409, 'retake_locked', 'Пересдача пока недоступна', { available_at: allowed.available_at });
      let blueprint: TestBlueprint | undefined;
      if (d.vacancy_id) {
        const vacancy = await tx.vacancy.findFirst({ where: { id: d.vacancy_id, status: 'published' } });
        if (!vacancy) throw new Problem(404, 'not_found', 'Вакансия не найдена');
        if (vacancy.specialization !== specialization || vacancy.grade !== d.declared_grade) throw new Problem(422, 'validation_error', 'Категория не соответствует вакансии', { errors: [{ pointer: '/declared_grade', detail: 'Выберите категорию вакансии' }] });
        blueprint = vacancyBlueprint({ id: vacancy.id, title: vacancy.title, specialization, grade: d.declared_grade,
          mustSkills: vacancy.mustSkills, niceSkills: vacancy.niceSkills }, now);
        if (!blueprint.competencies.length || blueprint.competencies.some(c => c.families_count === 0))
          throw new Problem(409, 'conflict', 'Банк не покрывает требования вакансии');
      }
      const inventory = bankInventory(specialization, mode.policy.max, mode.policy.maxExposure);
      if (!inventory.sufficientInventory) throw new Problem(409, 'conflict', 'Банк этой специализации ещё не готов к тестированию');
      const bank = LIVE_BANK.filter(f => f.specializations.includes(specialization)
        && (!blueprint || blueprint.competencies.some(c => c.competency_id === f.competency)));
      const required = requiredCompetencies(bank, DEFAULT_POLICY.maxExposure);
      if (bank.length < Math.ceil(mode.policy.max / mode.policy.maxExposure) || !required.length) throw new Problem(409, 'conflict', 'Недостаточно семейств для бланка вакансии');
      let gradeCuts: GradeCuts;
      try {
        gradeCuts = JSON.parse(process.env.ASSESSMENT_GRADE_POLICY || DEFAULT_GRADE_POLICY) as GradeCuts;
        validateGradeCuts(gradeCuts);
      } catch { throw new Problem(409, 'conflict', 'Политика порогов тестирования не настроена'); }
      const practiceBank = PRACTICE_BANK.filter(f => f.specializations.includes(specialization));
      const practiceLanguage = specialization === 'frontend' ? 'javascript' : 'python';
      const practiceRuntimeVersion = process.env[`PISTON_${practiceLanguage.toUpperCase()}_VERSION`];
      const practice = !mode.policy.express && practiceBank.length >= Math.ceil(DEFAULT_POLICY.practiceTotal / DEFAULT_POLICY.maxExposure)
        && await runtimeAvailable({ url: process.env.PISTON_EXECUTE_URL, version: practiceRuntimeVersion, language: practiceLanguage });
      const policy: SessionPolicy = { ...mode.policy, gradeCuts, skillConfirmationPolicyVersion: SKILL_CONFIRMATION_POLICY.version,
        familyIds: bank.map(f => f.id), requiredCompetencies: required,
        ...(practice ? { practiceBankVersion: PRACTICE_BANK_VERSION, practiceFamilyIds: practiceBank.map(f => f.id), practiceLanguage, practiceRuntimeVersion }
          : { practiceTotal: 0, approachTotal: 0 }) };
      if (blueprint) {
        policy.vacancyBlueprint = blueprint;
        policy.competencyWeights = Object.fromEntries(blueprint.competencies.map(c => [c.competency_id, c.share]));
      }
      const test = await tx.testSession.create({ data: { candidateId: c.id, specialization, declaredGrade: d.declared_grade, seed: randomInt(0, 2147483647),
        startedAt: now, deadlineAt: new Date(now.getTime() + mode.timeLimitSec * 1000), policy: policy as unknown as Prisma.InputJsonObject, bankVersion: LIVE_BANK_VERSION,
        exceptionParentId: policy.express ? null : exceptionParent(state, d.declared_grade), vacancyId: d.vacancy_id ?? null } });
      return { id: test.id, specialization, declared_grade: d.declared_grade, status: test.status, started_at: test.startedAt.toISOString(), deadline_at: test.deadlineAt.toISOString(),
        finished_at: null, express: policy.express === true, time_limit_sec: mode.timeLimitSec, progress: progress([], policy), vacancy_id: test.vacancyId };
    });
  }
  @Get(':id/next')
  async next(@Req() req: { identity: Identity }, @Param('id') id: string) {
    parse(z.uuid(), id);
    const c = await this.candidate(req.identity);
    const result = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      if (!await tx.testSession.findFirst({ where: { id, candidateId: c.id }, select: { id: true } })) throw new Problem(404, 'not_found', 'Тест не найден');
      await tx.$queryRaw`SELECT id FROM "TestSession" WHERE id = ${id}::uuid FOR UPDATE`;
      const t = await tx.testSession.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { ordinal: 'asc' } } } });
      const now = new Date();
      if (t.status === 'in_progress' && t.deadlineAt <= now) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: now } });
        return null;
      }
      if (t.status !== 'in_progress') throw new Problem(409, 'test_not_active', 'Тест не активен');
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const policy = t.policy as unknown as SessionPolicy;
      validatePolicy(policy);
      const existing = currentItem(t.items as IssuedItem[]);
      if (existing) return { status: 'item', item: t.items.find(i => i.id === existing.id)!.publicItem as unknown as TestItem, progress: progress(t.items as IssuedItem[], policy), deadline_at: t.deadlineAt.toISOString() };
      if (t.bankVersion !== LIVE_BANK_VERSION || !policy.familyIds?.length || !policy.requiredCompetencies?.length) throw new Problem(409, 'conflict', 'Версия банка сессии недоступна');
      const bank = LIVE_BANK.filter(f => policy.familyIds!.includes(f.id) && f.specializations.includes(t.specialization as Specialization));
      if (bank.length !== policy.familyIds.length) throw new Problem(409, 'conflict', 'Состав банка сессии изменился');
      const answered = t.items.filter(i => i.block === 'adaptive' && i.answeredAt);
      const pending = t.items.filter(i => i.answeredAt && i.correct === null);
      if (pending.length) {
        const failed = await tx.outbox.findFirst({ where: { topic: CODE_JOB_TOPIC, failedAt: { not: null },
          OR: pending.map(i => ({ payload: { path: ['itemId'], equals: i.id } })) }, select: { id: true } });
        if (failed) throw new Problem(500, 'internal_error', 'Проверка решения временно недоступна', {
          assessment_state: 'grading_failed', detail: 'Ответ сохранён. Проверку нужно восстановить; ошибка сервиса не считается неверным решением.' });
        throw new Problem(409, 'conflict', 'Ответ проверяется', { assessment_state: 'grading_pending', retry_after_sec: 2 });
      }
      const counts: Record<string, number> = {};
      for (const item of answered) counts[item.competency] = (counts[item.competency] ?? 0) + 1;
      const state: CatState = { responses: answered.map(itemResponse), servedIds: t.items.map(i => i.familyId), competencyCounts: counts };
      // Serialize exposure reservations for the same bank and specialization across all replicas.
      const lock = `assessment:${t.bankVersion}:${t.specialization}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lock}, 0))`;
      const reservedAt = new Date();
      if (t.deadlineAt <= reservedAt) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: reservedAt } });
        return null;
      }
      const window = new Date(reservedAt.getTime() - 90 * 86400000);
      const cohort = { bankVersion: t.bankVersion, specialization: t.specialization, startedAt: { gte: window, lte: reservedAt } };
      const total = await tx.testSession.count({ where: cohort });
      const usages = await tx.testItem.groupBy({ by: ['familyId'], where: { session: cohort }, _count: { _all: true } });
      const usageByFamily = new Map(usages.map(u => [u.familyId, u._count._all]));
      const blocked: Record<string, number> = {};
      for (const f of bank) blocked[f.id] = exposure(total, usageByFamily.get(f.id) ?? 0, policy.maxExposure).canServe ? 0 : 1;
      const choice = selectWithWaiver(bank, state, policy, blocked, coveredCompetencies(policy), seededRandom(t.seed ^ Math.imul(t.items.length + 1, 0x9e3779b1)));
      if (choice.waived.length) {
        policy.waivedCompetencies = [...policy.waivedCompetencies ?? [], ...choice.waived];
        await tx.testSession.update({ where: { id }, data: { policy: policy as unknown as Prisma.InputJsonObject } });
      }
      const issuedAt = new Date();
      if (t.deadlineAt <= issuedAt) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: issuedAt } });
        return null;
      }
      if (!choice.family) {
        if (!['precision', 'max_length'].includes(choice.reason)) throw new Problem(409, 'conflict', 'Доступные семейства временно исчерпаны');
        if (coveredCompetencies(policy).some(k => !counts[k])) throw new Problem(409, 'conflict', 'Не покрыты обязательные компетенции');
        const completedPractice = t.items.filter(i => i.block === 'practice' && i.answeredAt).length;
        if (completedPractice < policy.practiceTotal) {
          if (policy.practiceBankVersion !== PRACTICE_BANK_VERSION || !policy.practiceFamilyIds?.length || !policy.practiceLanguage || !policy.practiceRuntimeVersion)
            throw new Problem(409, 'conflict', 'Версия практического банка сессии недоступна');
          const practiceBank = PRACTICE_BANK.filter(f => policy.practiceFamilyIds!.includes(f.id) && f.specializations.includes(t.specialization as Specialization));
          if (practiceBank.length !== policy.practiceFamilyIds.length) throw new Problem(409, 'conflict', 'Состав практического банка изменился');
          const practiceCohort = { ...cohort, policy: { path: ['practiceBankVersion'], equals: policy.practiceBankVersion } };
          const practiceTotal = await tx.testSession.count({ where: practiceCohort });
          const practiceUsages = await tx.testItem.groupBy({ by: ['familyId'], where: { session: practiceCohort }, _count: { _all: true } });
          const family = selectPracticeFamily(practiceBank, t.items.map(i => i.familyId), practiceTotal,
            new Map(practiceUsages.map(u => [u.familyId, u._count._all])), policy.maxExposure, seededRandom(t.seed ^ 0x51ed270b));
          if (!family) throw new Problem(409, 'conflict', 'Практические семейства временно исчерпаны');
          const practiceAt = new Date();
          if (t.deadlineAt <= practiceAt) {
            await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: practiceAt } });
            return null;
          }
          const instance = instantiatePractice(family, randomInt(0, 2147483647), randomUUID(), t.items.length + 1, policy.practiceLanguage);
          const issued = await tx.testItem.create({ data: { id: instance.publicItem.instance_id, sessionId: id, familyId: family.id, templateVersion: instance.templateVersion,
            ordinal: instance.publicItem.index, block: 'practice', competency: family.competency, issuedAt: practiceAt,
            parameters: instance.parameters, publicItem: instance.publicItem as unknown as Prisma.InputJsonObject,
            expectedAnswer: instance.expectedAnswer as unknown as Prisma.InputJsonObject, discrimination: instance.discrimination, difficulty: instance.difficulty } });
          return { status: 'item', item: instance.publicItem, progress: progress([...t.items, issued] as IssuedItem[], policy, true), deadline_at: t.deadlineAt.toISOString() };
        }
        const practiceFailed = t.items.some(i => i.block === 'practice' && i.correct === false);
        const approachCompleted = t.items.filter(i => i.block === 'approach' && i.answeredAt).length;
        if (!practiceFailed && approachCompleted < (policy.approachTotal ?? 0)) throw new Problem(409, 'conflict', 'Уточняющий вопрос ещё не подготовлен');
        return { status: 'ready_to_finish', item: null, progress: progress(t.items as IssuedItem[], policy, true), deadline_at: t.deadlineAt.toISOString() };
      }
      const family = bank.find(f => f.id === choice.family!.id)!;
      const instance = instantiate(family, randomInt(0, 2147483647), randomUUID(), t.items.length + 1);
      const issued = await tx.testItem.create({ data: { id: instance.publicItem.instance_id, sessionId: id, familyId: family.id, templateVersion: instance.templateVersion,
        ordinal: instance.publicItem.index, block: 'adaptive', competency: family.competency, issuedAt,
        parameters: instance.parameters, publicItem: instance.publicItem as unknown as Prisma.InputJsonObject,
        expectedAnswer: instance.expectedAnswer as unknown as Prisma.InputJsonObject, discrimination: instance.discrimination, difficulty: instance.difficulty } });
      return { status: 'item', item: instance.publicItem, progress: progress([...t.items, issued] as IssuedItem[], policy), deadline_at: t.deadlineAt.toISOString() };
    }, { timeout: 15000 });
    if (!result) throw new Problem(409, 'test_not_active', 'Срок теста истёк');
    return result;
  }
}
