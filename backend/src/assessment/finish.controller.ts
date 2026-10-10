import { Controller, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { parse } from '../common/validation.js';
import { FinishTestResponse } from '../contract/schemas.js';
import type { Grade, Specialization, TestResult } from '../contract/model/index.js';
import { afterDays, gradeChangeAvailable, eligibility } from '../common/retake.js';
import { category } from '../matching/matching.js';
import { competencyScores, resultTrace, skipOutstanding, scoreCompletion } from './completion.js';
import { GRADE_ORDER, empiricalPercentile, modelPercentile } from './result-scoring.js';
import { normativeCohort, normativePolicySignature } from './normative-cohort.js';
import { telemetryFlags } from './telemetry-flags.js';
import type { SessionPolicy } from './session-state.js';
import { confirmedSkills, SKILL_CONFIRMATION_POLICY } from './confirmed-skills.js';
import { LIVE_BANK, LIVE_BANK_VERSION } from './live-bank.js';
import { skills as taxonomySkills } from '../taxonomy/taxonomy.controller.js';

@Controller('tests')
@UseGuards(AuthGuard)
export class AssessmentFinishController {
  constructor(private readonly db: Database) {}
  @Post(':id/finish') @HttpCode(200)
  async finish(@Req() req: { identity: Identity }, @Param('id') id: string) {
    if (req.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    parse(z.uuid(), id);
    const candidate = await this.db.candidate.findFirst({ where: { user: { subject: req.identity.sub } }, select: { id: true } });
    if (!candidate) throw new Problem(404, 'not_found', 'Профиль не найден');
    const result = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      const c = await tx.candidate.findUniqueOrThrow({ where: { id: candidate.id } });
      if (!await tx.testSession.findFirst({ where: { id, candidateId: c.id }, select: { id: true } })) throw new Problem(404, 'not_found', 'Тест не найден');
      await tx.$queryRaw`SELECT id FROM "TestSession" WHERE id = ${id}::uuid FOR UPDATE`;
      const test = await tx.testSession.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { ordinal: 'asc' } } } });
      if (test.status === 'finished') {
        const saved = FinishTestResponse.safeParse(test.result);
        if (!saved.success || saved.data.test_id !== id) throw new Problem(500, 'internal_error', 'Результат повреждён');
        return saved.data;
      }
      let now = new Date();
      if (test.status === 'in_progress' && test.deadlineAt <= now) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: now } });
        return null;
      }
      if (test.status !== 'in_progress') throw new Problem(409, 'test_not_active', 'Тест не активен');
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const policy = test.policy as unknown as SessionPolicy;
      if (!policy.gradeCuts) throw new Problem(409, 'conflict', 'В сессии нет утверждённой политики порогов');
      const skipped = skipOutstanding(test.items as (typeof test.items[number] & { block: 'adaptive' | 'practice' | 'approach' })[], now);
      const items = skipped.items;
      if (items.some(i => i.correct === null)) throw new Problem(409, 'conflict', 'Ответ ещё оценивается');
      const scored = scoreCompletion(items, policy, test.declaredGrade as Grade, policy.gradeCuts);
      const flags = telemetryFlags(items.map(i => {
        const telemetry = i.telemetry as Prisma.JsonObject;
        return { familyId: i.familyId, correct: i.correct, difficulty: i.difficulty,
          serverElapsedMs: Number(telemetry.server_elapsed_ms ?? 0), pasteCount: Number(telemetry.paste_count ?? 0), focusLostCount: Number(telemetry.focus_lost_count ?? 0) };
      }), scored.theta, []); // No fabricated timing norms: fast_correct needs actual saved models.
      now = new Date();
      if (test.deadlineAt <= now) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: now } });
        return null;
      }
      const sameCategory = c.confirmedSpecialization === test.specialization && c.grade === test.declaredGrade;
      const mayConfirm = scored.outcome !== 'failed' && (sameCategory || gradeChangeAvailable({ lastGradeChangeAt: c.gradeChangedAt }, now));
      const assignedGrade = (mayConfirm ? test.declaredGrade : c.grade) as Grade | null;
      const assignedSpecialization = (mayConfirm ? test.specialization : c.confirmedSpecialization) as Specialization | null;
      const profile = c.profile as Prisma.JsonObject;
      const oldStanding = profile.standing as Prisma.JsonObject | undefined;
      const normTests = mayConfirm ? await tx.testSession.findMany({ where: {
        candidateId: { not: c.id }, bankVersion: test.bankVersion, specialization: test.specialization,
        declaredGrade: test.declaredGrade, status: 'finished', finishedAt: { lte: now },
        AND: [{ policy: { path: ['gradeCuts', 'version'], equals: policy.gradeCuts.version } },
          { result: { path: ['assigned_grade'], equals: test.declaredGrade } }],
      }, select: { id: true, candidateId: true, bankVersion: true, specialization: true, declaredGrade: true, policy: true, result: true, finishedAt: true } }) : [];
      const cohort = normativeCohort(normTests.map(t => {
        const r = t.result as Prisma.JsonObject, p = t.policy as Prisma.JsonObject;
        const resultCategory = r.category as Prisma.JsonObject | null;
        let policySignature = '';
        try { policySignature = normativePolicySignature(p as unknown as SessionPolicy); } catch { /* Invalid historic policy cannot contribute a norm. */ }
        return { id: t.id, candidateId: t.candidateId, bankVersion: t.bankVersion,
          policySignature,
          policyVersion: String((p.gradeCuts as Prisma.JsonObject)?.version ?? ''), specialization: t.specialization as Specialization,
          declaredGrade: t.declaredGrade as Grade, assignedGrade: r.assigned_grade as Grade | null,
          assignedSpecialization: resultCategory?.specialization as Specialization | null,
          outcome: r.outcome as TestResult['outcome'], theta: typeof r.theta === 'number' ? r.theta : NaN, finishedAt: t.finishedAt! };
      }), { candidateId: c.id, bankVersion: test.bankVersion, policyVersion: policy.gradeCuts.version,
        policySignature: normativePolicySignature(policy),
        specialization: test.specialization as Specialization, grade: test.declaredGrade as Grade, at: now });
      const percentile = mayConfirm ? empiricalPercentile(scored.theta, c.id, cohort) ?? modelPercentile(scored.theta)
        : typeof oldStanding?.percentile === 'number' ? oldStanding.percentile : null;
      const lower = GRADE_ORDER[GRADE_ORDER.indexOf(test.declaredGrade as Grade) - 1] ?? null;
      const suggested = scored.suggestedHigherGrade ?? (scored.outcome === 'failed' ? lower : null);
      const history = await tx.testSession.findMany({ where: { candidateId: c.id, specialization: test.specialization } });
      const suggestedEligibility = suggested ? eligibility({ surveyCompleted: c.surveyCompleted, activeTestId: null,
        currentGrade: assignedSpecialization === test.specialization ? assignedGrade : null,
        lastGradeChangeAt: mayConfirm && !sameCategory ? now : c.gradeChangedAt, experienceYears: null,
        attempts: history.map(t => ({ id: t.id, grade: t.declaredGrade as Grade, startedAt: t.startedAt,
          finishedAt: t.id === id ? now : t.finishedAt, exceptionParentId: t.exceptionParentId,
          outcome: t.id === id ? scored.outcome : ((t.result as Prisma.JsonObject | null)?.outcome ?? null) as TestResult['outcome'] | null })) }, now).find(g => g.grade === suggested) : null;
      const changed = mayConfirm && !sameCategory;
      const verifiedSkills = confirmedSkills(mayConfirm && test.bankVersion === LIVE_BANK_VERSION
        && policy.skillConfirmationPolicyVersion === SKILL_CONFIRMATION_POLICY.version, items, LIVE_BANK, taxonomySkills);
      const previousSkills = (Array.isArray(profile.skills) ? profile.skills : []) as Prisma.JsonObject[];
      const protectedSkillIds = new Set(previousSkills.filter(s => s.source === 'fsp' || s.source === 'task').map(s => s.skill_id));
      const changeAt = changed ? now : c.gradeChangedAt;
      const output: TestResult = {
        test_id: id, specialization: test.specialization as Specialization, declared_grade: test.declaredGrade as Grade,
        outcome: scored.outcome, assigned_grade: assignedGrade, category: assignedGrade && assignedSpecialization ? category(assignedSpecialization, assignedGrade) : null,
        percentile, theta: scored.theta, se: scored.se, confidence: scored.incomplete || flags.some(f => f.severity === 'warning') ? 'low' : scored.se <= policy.targetSe ? 'high' : 'medium',
        confirmed_skills: verifiedSkills, competencies: competencyScores(items), flags,
        suggestion: { action: suggested ? scored.outcome === 'failed' ? 'try_lower' : 'try_higher' : 'none', grade: suggested, available_at: suggestedEligibility?.available_at ?? null,
          message: scored.incomplete ? 'Тест завершён досрочно; обязательные блоки не пройдены, новая категория не подтверждена.'
            : scored.practiceFailed ? 'Практика или уточняющий вопрос не пройдены; новая категория не подтверждена.'
            : suggested ? 'Доступность следующей попытки проверьте в правилах пересдачи.' : 'Результат сохранён.' },
        items_answered: items.length, duration_sec: Math.max(0, Math.floor((now.getTime() - test.startedAt.getTime()) / 1000)), finished_at: now.toISOString(),
        next_retake_at: afterDays(now, 30).toISOString(), next_grade_change_at: changeAt ? afterDays(changeAt, 90).toISOString() : null, trace: resultTrace(items),
      };
      const validated = FinishTestResponse.parse(output);
      const committedAt = new Date();
      if (test.deadlineAt <= committedAt) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: committedAt } });
        return null;
      }
      if (skipped.skippedIds.length) await tx.testItem.updateMany({ where: { sessionId: id, id: { in: skipped.skippedIds }, answeredAt: null },
        data: { answer: { skipped: true }, correct: false, answeredAt: now } });
      await tx.testSession.update({ where: { id }, data: { status: 'finished', finishedAt: now, result: validated as unknown as Prisma.InputJsonObject } });
      if (mayConfirm) {
        await tx.candidate.update({ where: { id: c.id }, data: { confirmedSpecialization: test.specialization, grade: test.declaredGrade,
          theta: scored.theta, standardError: scored.se, gradeChangedAt: changeAt,
          profile: { ...profile, skills: [
            ...previousSkills.filter(s => !(changed && s.source === 'test')
              && (protectedSkillIds.has(s.skill_id) || !verifiedSkills.some(v => v.skill_id === s.skill_id))),
            ...verifiedSkills.filter(s => !protectedSkillIds.has(s.skill_id)),
          ], standing: percentile !== null ? {
            category: category(test.specialization as Specialization, test.declaredGrade as Grade), percentile, confirmed_at: now.toISOString(), test_id: id, flags: flags.map(f => ({ code: f.code, severity: f.severity })),
          } : changed ? null : profile.standing ?? null } as Prisma.InputJsonObject } });
        if (changed) await tx.gradeHistory.create({ data: { candidateId: c.id, specialization: test.specialization, grade: test.declaredGrade,
          previousGrade: c.grade, previousSpecialization: c.confirmedSpecialization, testId: id, changedAt: now, reason: 'test_passed' } });
      }
      await tx.audit.create({ data: { actorSubject: req.identity.sub, action: 'assessment.finished', resourceId: id,
        metadata: { outcome: scored.outcome, policy_version: policy.gradeCuts.version, bank_version: test.bankVersion,
          normative_candidates: cohort.length, category_changed: changed, incomplete: scored.incomplete, practice_failed: scored.practiceFailed, issued_skips: skipped.skippedIds.length,
          skill_policy_version: policy.skillConfirmationPolicyVersion ?? null, confirmed_skills: verifiedSkills.map(s => s.skill_id) } } });
      return validated;
    }, { timeout: 15000 });
    if (!result) throw new Problem(409, 'test_not_active', 'Срок теста истёк');
    return result;
  }
}
