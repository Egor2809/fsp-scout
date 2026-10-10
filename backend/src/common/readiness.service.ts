import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Database } from '../database/database.service.js';
import { Problem } from './problem.js';
import { redisOptions } from './redis-options.js';
import { SharedProbe } from './shared-probe.js';

@Injectable()
export class Readiness implements OnModuleDestroy {
  private readonly queue = new Queue('assessment-grading', { connection: {
    ...redisOptions(process.env.REDIS_URL ?? 'redis://localhost:6379'),
    connectTimeout: 1500, commandTimeout: 1500, maxRetriesPerRequest: 1, enableOfflineQueue: false,
  } });
  private readonly probe = new SharedProbe<{ status: string }>();
  constructor(private readonly db: Database) {
    // Readiness reports availability without logging Redis URLs or credentials.
    this.queue.on('error', () => {});
  }
  async check(): Promise<{ status: string }> {
    try {
      return await this.probe.run(async () => {
        // allSettled retains the gate until BOTH resources actually finish.
        const checks = await Promise.allSettled([this.db.$queryRaw`SELECT 1`, this.queue.client.then(client => client.ping()).then(reply => {
          if (reply !== 'PONG') throw new Error('Redis unavailable');
        })]);
        if (checks.some(check => check.status === 'rejected')) throw new Error('Dependency unavailable');
        return { status: 'ok' };
      }, 2000);
    } catch { throw new Problem(503, 'service_unavailable', 'Сервис временно недоступен'); }
  }
  async onModuleDestroy(): Promise<void> { await this.queue.disconnect(); }
}
