import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { isOrdinaryJson, isRankingJson } from './common/body-limits.js';
import { AppModule } from './app.module.js';
import { ProblemFilter } from './common/problem.js';
import { ContractResponseInterceptor } from './common/contract-response.interceptor.js';

async function main(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true, bodyParser: false });
  // 40M permitted text characters may occupy 240MB when JSON-escaped.
  app.useBodyParser('json', { limit: '256mb', type: isRankingJson });
  app.useBodyParser('json', { limit: '100kb', type: isOrdinaryJson });
  app.useBodyParser('urlencoded', { limit: '100kb', extended: false });
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ProblemFilter());
  app.useGlobalInterceptors(new ContractResponseInterceptor());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: false });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 8000), '0.0.0.0');
}
void main();
