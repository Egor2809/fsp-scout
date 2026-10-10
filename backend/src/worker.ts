import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { Queue, Worker } from 'bullmq';
import { assignRegularTasks } from './tasks/assignment.js';
import { processAssessmentCodeJob } from './assessment/code-grading-worker.js';
import { redisOptions } from './common/redis-options.js';
import { processAccountDeletion } from './users/account-deletion-worker.js';

const database = new PrismaClient();
const connection = redisOptions(process.env.REDIS_URL ?? 'redis://localhost:6379');
const queue = new Queue('maintenance', { connection });
const gradingQueue = new Queue('assessment-grading', { connection });
const erasureQueue = new Queue('account-erasure', { connection });
const erasureWorker = new Worker('account-erasure', async job => {
  if (job.name !== 'erase') throw new Error('Unsupported erasure job');
  await processAccountDeletion(database);
}, { connection, concurrency: 1 });
erasureWorker.on('error', () => console.error(JSON.stringify({ event: 'account.erasure.worker.error' })));
erasureWorker.on('failed', () => console.error(JSON.stringify({ event: 'account.erasure.job.failed' })));
await erasureQueue.upsertJobScheduler('erase-every-minute', { every: 60000 }, {
  name: 'erase', data: {}, opts: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 100 },
});
const gradingWorker = new Worker('assessment-grading', async job => {
  if (job.name !== 'dispatch') throw new Error('Unsupported grading job');
  await processAssessmentCodeJob(database);
}, { connection, concurrency: 2 });
gradingWorker.on('error', () => console.error(JSON.stringify({ event: 'assessment.grading.worker.error' })));
gradingWorker.on('failed', job => console.error(JSON.stringify({ event: 'assessment.grading.job.failed', id: job?.id })));
await gradingQueue.upsertJobScheduler('grade-every-five-seconds', { every: 5000 }, {
  name: 'dispatch', data: {}, opts: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 100 },
});

const worker = new Worker('maintenance', async job => {
  if (job.name !== 'expire') throw new Error('Unsupported maintenance job');
  // SKIP LOCKED coordinates replicas; one transaction changes state and writes events.
  await database.$transaction(async tx => {
    const now = new Date();
    const expired = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Invitation" WHERE status IN ('sent','viewed','postponed')
      AND "expiresAt" <= ${now} ORDER BY "expiresAt" LIMIT 100 FOR UPDATE SKIP LOCKED`;
    for (const row of expired) {
      await tx.invitation.update({ where: { id: row.id }, data: { status: 'expired',
        events: { create: { status: 'expired', actor: 'system', note: 'Срок ответа истёк', at: now } } } });
    }
    await tx.testSession.updateMany({ where: { status: 'in_progress', deadlineAt: { lte: now } }, data: { status: 'expired', finishedAt: now } });
  });
  await assignRegularTasks(database);
}, { connection, concurrency: 1 });

worker.on('error', () => console.error(JSON.stringify({ event: 'maintenance.worker.error' })));
worker.on('failed', job => console.error(JSON.stringify({ event: 'maintenance.job.failed', id: job?.id })));

await queue.upsertJobScheduler('expire-every-minute', { every: 60000 }, {
  name: 'expire', data: {}, opts: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 100 },
});

let stopping = false;
async function shutdown(): Promise<void> {
  if (stopping) return;
  stopping = true;
  await worker.close();
  await gradingWorker.close();
  await erasureWorker.close();
  await queue.close();
  await gradingQueue.close();
  await erasureQueue.close();
  await database.$disconnect();
}
process.on('SIGTERM', () => { void shutdown(); });
process.on('SIGINT', () => { void shutdown(); });
