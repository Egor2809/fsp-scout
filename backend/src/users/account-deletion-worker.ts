import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { identityTombstone } from '../auth/deleted-identity.js';
import { deleteKeycloakUser } from '../auth/keycloak-deletion.js';

const TOPIC = 'account.delete_requested';
const eraseIdentity = (subject: string) => deleteKeycloakUser(subject, {
  baseUrl: process.env.KEYCLOAK_INTERNAL_BASE_URL ?? '', realm: process.env.KEYCLOAK_REALM ?? '',
  issuer: process.env.OIDC_ISSUER ?? '',
  clientId: process.env.KEYCLOAK_ERASURE_CLIENT_ID ?? '', clientSecret: process.env.KEYCLOAK_ERASURE_CLIENT_SECRET ?? '',
});
export async function processAccountDeletion(db: PrismaClient, erase: (subject: string) => Promise<void> = eraseIdentity): Promise<void> {
  const token = randomUUID(), now = new Date();
  const job = await db.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Outbox" WHERE topic = ${TOPIC}
      AND "deliveredAt" IS NULL AND "failedAt" IS NULL AND "availableAt" <= ${now}
      AND ("claimUntil" IS NULL OR "claimUntil" <= ${now}) ORDER BY "createdAt" LIMIT 1 FOR UPDATE SKIP LOCKED`;
    return rows.length ? tx.outbox.update({ where: { id: rows[0].id }, data: {
      claimToken: token, claimUntil: new Date(now.getTime() + 120000), attempts: { increment: 1 },
    } }) : null;
  });
  if (!job) return;
  const payload = (job.payload && typeof job.payload === 'object' && !Array.isArray(job.payload) ? job.payload : {}) as Record<string, unknown>;
  if (typeof payload.subject !== 'string' || !payload.subject || typeof payload.issuer !== 'string' || !payload.issuer || typeof payload.identityHash !== 'string'
    || payload.issuer !== process.env.OIDC_ISSUER || identityTombstone(payload.issuer, payload.subject) !== payload.identityHash) {
    await db.outbox.updateMany({ where: { id: job.id, claimToken: token }, data: { failedAt: new Date(),
      lastErrorCode: 'invalid_deletion_identity', claimToken: null, claimUntil: null } });
    return;
  }
  const { subject, identityHash } = payload as { subject: string; identityHash: string };
  try {
    await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${subject}, 0))`;
      const user = await tx.user.findUnique({ where: { subject }, include: { candidate: true } });
      if (user?.candidate) await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${user.candidate.id}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Outbox" WHERE id = ${job.id}::uuid FOR UPDATE`;
      const lease = await tx.outbox.findUniqueOrThrow({ where: { id: job.id } });
      if (lease.claimToken !== token || !lease.claimUntil || lease.claimUntil <= new Date()) throw new Error('Lease lost');
      if (!await tx.deletedIdentity.findUnique({ where: { identityHash } })) throw new Error('Deletion not authorized');
      const resourceIds = user ? [user.id] : [];
      if (user?.candidate) {
        const candidateId = user.candidate.id;
        resourceIds.push(candidateId);
        const tests = await tx.testSession.findMany({ where: { candidateId }, select: { id: true } });
        const invitations = await tx.invitation.findMany({ where: { candidateId }, select: { id: true } });
        const applications = await tx.application.findMany({ where: { candidateId }, select: { id: true } });
        const submissions = await tx.taskSubmission.findMany({ where: { candidateId }, select: { id: true } });
        resourceIds.push(...[...tests, ...invitations, ...applications, ...submissions].map(x => x.id));
        // Restrict edges must be removed before Candidate/User cascading deletion.
        await tx.testSession.updateMany({ where: { candidateId }, data: { exceptionParentId: null } });
        await tx.shortlist.deleteMany({ where: { candidateId } });
        await tx.disclosure.deleteMany({ where: { candidateId } });
        await tx.invitation.deleteMany({ where: { candidateId } });
        await tx.outbox.deleteMany({ where: { id: { not: job.id }, payload: { path: ['candidateId'], equals: candidateId } } });
        if (submissions.length) await tx.outbox.deleteMany({ where: { id: { not: job.id },
          OR: submissions.map(s => ({ payload: { path: ['submission_id'], equals: s.id } })) } });
      }
      const participants = await tx.fspParticipant.findMany({ where: { ownerSubject: subject }, select: { id: true } });
      resourceIds.push(...participants.map(p => p.id));
      await tx.fspLink.deleteMany({ where: { participant: { ownerSubject: subject } } });
      await tx.fspParticipant.deleteMany({ where: { ownerSubject: subject } });
      await tx.audit.deleteMany({ where: { OR: [{ actorSubject: subject }, { resourceId: { in: resourceIds } }] } });
      if (user) await tx.user.delete({ where: { id: user.id } });
    });
    await erase(subject);
    await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Outbox" WHERE id = ${job.id}::uuid FOR UPDATE`;
      const lease = await tx.outbox.findUniqueOrThrow({ where: { id: job.id } });
      if (lease.claimToken !== token || !lease.claimUntil || lease.claimUntil <= new Date()) return;
      const completedAt = new Date();
      await tx.deletedIdentity.update({ where: { identityHash }, data: { completedAt } });
      await tx.outbox.update({ where: { id: job.id }, data: { payload: {}, deliveredAt: completedAt, claimToken: null, claimUntil: null, lastErrorCode: null } });
    });
  } catch {
    await db.outbox.updateMany({ where: { id: job.id, claimToken: token }, data: { claimToken: null, claimUntil: null,
      availableAt: new Date(Date.now() + Math.min(300000, 10000 * Math.max(1, job.attempts))), lastErrorCode: 'account_deletion_unavailable' } });
  }
}
