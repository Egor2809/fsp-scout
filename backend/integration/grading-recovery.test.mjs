import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

test('grading recovery is one-time, preserves answer and refuses expired or leased jobs', async () => {
  assert.equal(process.env.TEST_DATABASE_ISOLATED, '1', 'Use a dedicated migrated test database and stop grading workers');
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const userId = randomUUID(), candidateId = randomUUID(), sessionId = randomUUID(), itemId = randomUUID(), jobId = randomUUID();
  const run = promisify(execFile);
  const retry = () => run(process.execPath, ['--import', 'tsx', 'scripts/retry-code-job.ts', jobId, 'Integration recovery test'],
    { timeout: 20000, env: process.env });
  const failed = () => db.outbox.update({ where: { id: jobId }, data: { failedAt: new Date(), attempts: 5,
    deliveredAt: null, claimUntil: null, claimToken: null, lastErrorCode: 'judge_unavailable' } });
  try {
    await db.user.create({ data: { id: userId, subject: `recovery-test-${userId}`, email: 'recovery@example.invalid', displayName: 'Fixture', role: 'candidate',
      candidate: { create: { id: candidateId, consents: { create: { type: 'personal_data', version: 'test' } } } } } });
    await db.testSession.create({ data: { id: sessionId, candidateId, specialization: 'backend', declaredGrade: 'middle', seed: 1,
      deadlineAt: new Date(Date.now() + 300000), items: { create: { id: itemId, familyId: 'recovery-fixture', templateVersion: 1,
        parameters: {}, publicItem: {}, expectedAnswer: {}, discrimination: 1, difficulty: 0, ordinal: 1, block: 'practice', competency: 'test',
        answer: { code: 'print(1)', language: 'python' }, answeredAt: new Date() } } } });
    await db.outbox.create({ data: { id: jobId, topic: 'assessment.code_submitted', payload: { candidateId, sessionId, itemId },
      failedAt: new Date(), attempts: 5, lastErrorCode: 'judge_unavailable' } });
    const initial = await db.testItem.findUniqueOrThrow({ where: { id: itemId } });
    const results = await Promise.allSettled([retry(), retry()]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1, 'Exactly one concurrent retry succeeds');
    const job = await db.outbox.findUniqueOrThrow({ where: { id: jobId } });
    assert.equal(job.failedAt, null);
    assert.equal(job.attempts, 0);
    assert.equal(job.claimToken, null);
    assert.equal(job.deliveredAt, null);
    assert.deepEqual(await db.testItem.findUniqueOrThrow({ where: { id: itemId } }), initial);
    const audits = await db.audit.findMany({ where: { action: 'assessment.code_retry', resourceId: sessionId } });
    assert.equal(audits.length, 1);
    assert.equal(audits[0].metadata.previous_attempts, 5);
    assert.equal(audits[0].metadata.previous_error, 'judge_unavailable');
    await failed();
    await db.outbox.update({ where: { id: jobId }, data: { claimToken: randomUUID(), claimUntil: new Date(Date.now() + 60000) } });
    await assert.rejects(retry());
    await failed();
    await db.testSession.update({ where: { id: sessionId }, data: { deadlineAt: new Date(Date.now() - 1000) } });
    await assert.rejects(retry());
    assert.equal((await db.outbox.findUniqueOrThrow({ where: { id: jobId } })).attempts, 5);
    assert.equal(await db.audit.count({ where: { action: 'assessment.code_retry', resourceId: sessionId } }), 1);
  } finally {
    await db.outbox.deleteMany({ where: { id: jobId } });
    await db.audit.deleteMany({ where: { action: 'assessment.code_retry', resourceId: sessionId } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  }
});
