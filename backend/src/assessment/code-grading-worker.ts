import type { PrismaClient } from '@prisma/client';
import { randomUUID, randomInt } from 'node:crypto';
import type { Answer, TestItem } from '../contract/model/index.js';
import type { ExpectedAnswer } from './grading.js';
import type { SessionPolicy } from './session-state.js';
import { JudgeError, runOpenTests } from './piston.js';
import { CODE_JOB_LEASE_MS, CODE_JOB_MAX_ATTEMPTS, CODE_JOB_TOPIC, codeJobPayload, codeRetry, mayCommitCodeResult } from './code-job.js';
import { buildApproach } from './approach.js';

/** One leased event per invocation. No database transaction spans the external execution. */
export async function processAssessmentCodeJob(db: PrismaClient): Promise<void> {
  const token = randomUUID(), now = new Date();
  await db.outbox.updateMany({ where: { topic: CODE_JOB_TOPIC, deliveredAt: null, failedAt: null,
    attempts: { gte: CODE_JOB_MAX_ATTEMPTS }, OR: [{ claimUntil: null }, { claimUntil: { lte: now } }] },
  data: { failedAt: now, lastErrorCode: 'attempt_limit', claimUntil: null, claimToken: null } });
  const job = await db.$transaction(async tx => {
    const available = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Outbox" WHERE topic = ${CODE_JOB_TOPIC} AND "deliveredAt" IS NULL AND "failedAt" IS NULL
      AND "availableAt" <= ${now} AND ("claimUntil" IS NULL OR "claimUntil" <= ${now})
      AND attempts < ${CODE_JOB_MAX_ATTEMPTS} ORDER BY "availableAt", "createdAt", id LIMIT 1 FOR UPDATE SKIP LOCKED`;
    if (!available.length) return null;
    return tx.outbox.update({ where: { id: available[0].id }, data: { claimToken: token,
      claimUntil: new Date(now.getTime() + CODE_JOB_LEASE_MS), attempts: { increment: 1 } } });
  });
  if (!job) return;
  const finishEvent = (errorCode: string | null = null) => db.outbox.updateMany({ where: { id: job.id, claimToken: token },
    data: { deliveredAt: new Date(), claimToken: null, claimUntil: null, lastErrorCode: errorCode } });
  try {
    const payload = codeJobPayload(job.payload);
    const item = await db.testItem.findUnique({ where: { id: payload.itemId }, include: { session: true } });
    if (!item || item.sessionId !== payload.sessionId || item.session.candidateId !== payload.candidateId) {
      await finishEvent('item_unavailable'); return;
    }
    const test = item.session;
    if (test.status !== 'in_progress' || test.deadlineAt <= new Date() || !item.answeredAt || item.correct !== null) {
      await finishEvent('obsolete'); return;
    }
    if (!await db.consent.findFirst({ where: { candidateId: payload.candidateId, type: 'personal_data', revokedAt: null } })) {
      await finishEvent('consent_revoked'); return;
    }
    const expected = item.expectedAnswer as unknown as ExpectedAnswer, answer = item.answer as unknown as Answer;
    const publicItem = item.publicItem as unknown as TestItem, policy = test.policy as unknown as SessionPolicy;
    if (expected.kind !== 'sandbox' || !expected.tests?.length || !answer?.code || !answer.language
      || answer.language !== publicItem.answer_language || policy.practiceLanguage !== answer.language
      || !policy.practiceRuntimeVersion || !process.env.PISTON_EXECUTE_URL) throw new JudgeError('configuration');
    const parameters = item.parameters as { parameter?: unknown };
    const approach = (policy.approachTotal ?? 0) > 0 ? buildApproach({ familyId: item.familyId, parameter: Number(parameters.parameter),
      code: answer.code, language: answer.language, seed: randomInt(0, 2147483647), id: randomUUID(), index: item.ordinal + 1 }) : null;
    const tests = approach ? [...expected.tests, approach.probe] : expected.tests;
    const judged = await runOpenTests({ code: answer.code, language: answer.language, tests, deadlineAt: test.deadlineAt },
      { url: process.env.PISTON_EXECUTE_URL, version: policy.practiceRuntimeVersion });
    const correct = judged.status === 'ok' && judged.total === tests.length && judged.passed === judged.total;
    await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${payload.candidateId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "TestSession" WHERE id = ${payload.sessionId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Outbox" WHERE id = ${job.id}::uuid FOR UPDATE`;
      const leased = await tx.outbox.findUnique({ where: { id: job.id } });
      const current = await tx.testItem.findUnique({ where: { id: item.id }, include: { session: true } });
      const committedAt = new Date();
      if (!leased || leased.claimToken !== token || !leased.claimUntil || leased.claimUntil <= committedAt) return;
      const consent = Boolean(await tx.consent.findFirst({ where: { candidateId: payload.candidateId, type: 'personal_data', revokedAt: null } }));
      if (current && mayCommitCodeResult({ active: current.session.status === 'in_progress', deadlineAt: current.session.deadlineAt,
        consent, answered: current.answeredAt !== null, correct: current.correct, tokenMatches: true, claimUntil: leased.claimUntil }, committedAt)) {
        await tx.testItem.update({ where: { id: item.id }, data: { correct } });
        if (correct && approach) await tx.testItem.create({ data: {
          id: approach.publicItem.instance_id, sessionId: payload.sessionId, familyId: approach.familyId, templateVersion: approach.templateVersion,
          ordinal: approach.publicItem.index, block: 'approach', competency: approach.publicItem.competency.id, issuedAt: committedAt,
          parameters: approach.parameters, publicItem: approach.publicItem as unknown as import('@prisma/client').Prisma.InputJsonObject,
          expectedAnswer: approach.expectedAnswer, discrimination: approach.discrimination, difficulty: approach.difficulty,
        } });
        await tx.audit.create({ data: { actorSubject: 'system', action: 'assessment.code_graded', resourceId: payload.sessionId,
          metadata: { instance_id: item.id, correct, runtime_version: policy.practiceRuntimeVersion } } });
      } else if (current?.session.status === 'in_progress' && current.session.deadlineAt <= committedAt) {
        await tx.testSession.update({ where: { id: payload.sessionId }, data: { status: 'expired', finishedAt: committedAt } });
      }
      await tx.outbox.update({ where: { id: job.id }, data: { deliveredAt: committedAt, claimUntil: null, claimToken: null, lastErrorCode: null } });
    });
  } catch (error) {
    const retry = codeRetry(job.attempts, new Date());
    const code = error instanceof JudgeError ? `judge_${error.reason}` : 'grading_unavailable';
    await db.outbox.updateMany({ where: { id: job.id, claimToken: token }, data: { ...retry, claimUntil: null, claimToken: null, lastErrorCode: code } });
  }
}
