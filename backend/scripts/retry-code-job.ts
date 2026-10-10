import { PrismaClient } from '@prisma/client';
import { CODE_JOB_TOPIC, codeJobPayload } from '../src/assessment/code-job.ts';

const [jobId, reason, ...extra] = process.argv.slice(2);
if (!jobId || !/^[0-9a-f-]{36}$/i.test(jobId) || !reason?.trim() || reason.length > 300 || extra.length)
  throw new Error('Usage: npm run assessment:retry -- <job-uuid> <operator-reason>');
const db = new PrismaClient();
try {
  const observed = await db.outbox.findUnique({ where: { id: jobId } });
  if (!observed || observed.topic !== CODE_JOB_TOPIC) throw new Error('Assessment grading job not found');
  const payload = codeJobPayload(observed.payload);
  await db.$transaction(async tx => {
    // Same lock order as grading commit and candidate consent updates.
    await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${payload.candidateId}::uuid FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "TestSession" WHERE id = ${payload.sessionId}::uuid FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "Outbox" WHERE id = ${jobId}::uuid FOR UPDATE`;
    const job = await tx.outbox.findUniqueOrThrow({ where: { id: jobId } });
    const current = codeJobPayload(job.payload);
    const now = new Date();
    if (JSON.stringify(current) !== JSON.stringify(payload) || job.topic !== CODE_JOB_TOPIC
      || !job.failedAt || job.deliveredAt || (job.claimUntil && job.claimUntil > now)) throw new Error('Job is not an idle failed assessment job');
    const item = await tx.testItem.findUnique({ where: { id: payload.itemId }, include: { session: true } });
    if (!item || item.sessionId !== payload.sessionId || item.session.candidateId !== payload.candidateId
      || item.session.status !== 'in_progress' || item.session.deadlineAt <= now || !item.answeredAt || item.correct !== null)
      throw new Error('Attempt expired, inactive, already graded or inconsistent; retry refused');
    if (!await tx.consent.findFirst({ where: { candidateId: payload.candidateId, type: 'personal_data', revokedAt: null } }))
      throw new Error('Personal data consent is not active');
    await tx.outbox.update({ where: { id: jobId }, data: { failedAt: null, attempts: 0, availableAt: now,
      claimToken: null, claimUntil: null, lastErrorCode: null } });
    await tx.audit.create({ data: { actorSubject: 'operator', action: 'assessment.code_retry', resourceId: payload.sessionId,
      metadata: { job_id: jobId, reason: reason.trim(), previous_attempts: job.attempts, previous_error: job.lastErrorCode } } });
  });
  console.log('Assessment grading job requeued:', jobId);
} finally { await db.$disconnect(); }
