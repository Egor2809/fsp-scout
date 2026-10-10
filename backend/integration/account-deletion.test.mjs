import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';

test('account purge survives provider failure and completes once without recreating local data', async () => {
  assert.equal(process.env.TEST_DATABASE_ISOLATED, '1', 'Dedicated migrated test DB and stopped erasure workers required');
  assert.ok(process.env.OIDC_ISSUER, 'Set OIDC_ISSUER');
  const { PrismaClient } = await import('@prisma/client');
  const { processAccountDeletion } = await import('../dist/users/account-deletion-worker.js');
  const db = new PrismaClient();
  const subject = randomUUID(), userId = randomUUID(), candidateId = randomUUID(), jobId = randomUUID();
  const issuer = process.env.OIDC_ISSUER;
  const identityHash = createHash('sha256').update(JSON.stringify([issuer, subject])).digest('hex');
  const firstTest = randomUUID(), secondTest = randomUUID();
  try {
    assert.equal(await db.outbox.count({ where: { topic: 'account.delete_requested', deliveredAt: null, failedAt: null } }), 0,
      'Fixture DB must have no unrelated pending deletions');
    await db.user.create({ data: { id: userId, subject, email: 'erase@example.invalid', displayName: 'Erase Fixture', role: 'candidate',
      candidate: { create: { id: candidateId, profile: { about: 'private-data' }, consents: { create: { type: 'personal_data', version: 'test' } } } } } });
    const data = { candidateId, specialization: 'backend', declaredGrade: 'middle', seed: 1, deadlineAt: new Date(), status: 'expired' };
    await db.testSession.create({ data: { ...data, id: firstTest } });
    await db.testSession.create({ data: { ...data, id: secondTest, exceptionParentId: firstTest } });
    await db.audit.create({ data: { actorSubject: subject, action: 'fixture', resourceId: candidateId, metadata: { private: 'must be removed' } } });
    await db.deletedIdentity.create({ data: { identityHash } });
    await db.outbox.create({ data: { id: jobId, topic: 'account.delete_requested', payload: { subject, issuer, identityHash, userId } } });
    let calls = 0;
    await processAccountDeletion(db, async id => { assert.equal(id, subject); calls++; throw new Error('Provider unavailable'); });
    assert.equal(await db.user.count({ where: { id: userId } }), 0);
    assert.equal(await db.candidate.count({ where: { id: candidateId } }), 0);
    assert.equal(await db.testSession.count({ where: { id: { in: [firstTest, secondTest] } } }), 0);
    assert.equal(await db.audit.count({ where: { actorSubject: subject } }), 0);
    assert.equal((await db.deletedIdentity.findUniqueOrThrow({ where: { identityHash } })).completedAt, null);
    const pending = await db.outbox.findUniqueOrThrow({ where: { id: jobId } });
    assert.equal(pending.deliveredAt, null);
    assert.equal(pending.claimToken, null);
    assert.equal(pending.lastErrorCode, 'account_deletion_unavailable');
    await db.outbox.update({ where: { id: jobId }, data: { availableAt: new Date(0) } });
    await processAccountDeletion(db, async id => { assert.equal(id, subject); calls++; });
    const done = await db.outbox.findUniqueOrThrow({ where: { id: jobId } });
    assert.ok(done.deliveredAt);
    assert.deepEqual(done.payload, {});
    assert.ok((await db.deletedIdentity.findUniqueOrThrow({ where: { identityHash } })).completedAt);
    await processAccountDeletion(db, async () => { calls++; });
    assert.equal(calls, 2);
  } finally {
    await db.outbox.deleteMany({ where: { id: jobId } });
    await db.audit.deleteMany({ where: { actorSubject: subject } });
    await db.testSession.updateMany({ where: { candidateId }, data: { exceptionParentId: null } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.deletedIdentity.deleteMany({ where: { identityHash } });
    await db.$disconnect();
  }
});
