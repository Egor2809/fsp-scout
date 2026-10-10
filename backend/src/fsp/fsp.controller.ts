import { Body, Controller, Delete, Get, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { FspWebhookBody, LinkMyFspBody } from '../contract/schemas.js';
import { parse } from '../common/validation.js';
import { Problem } from '../common/problem.js';
import { verifyHmac } from '../common/hmac.ts';
import { computeFspScore } from '../matching/fsp-score.ts';
import type { FspAchievement, Specialization } from '../contract/model/index.js';

type Request = { identity: Identity };
@Controller('me/fsp')
@UseGuards(AuthGuard)
export class FspController {
  constructor(private readonly db: Database) {}
  private async candidate(identity: Identity, tx: Prisma.TransactionClient = this.db) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const c = await tx.candidate.findFirst({ where: { user: { subject: identity.sub } }, include: { consents: true, fspLink: { include: { participant: true } } } });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    return c;
  }
  @Get()
  async get(@Req() r: Request) {
    const c = await this.candidate(r.identity);
    const permitted = c.consents.some(x => x.type === 'fsp_data' && !x.revokedAt);
    const link = permitted ? c.fspLink : null;
    const achievements = link ? link.participant.achievements as unknown as FspAchievement[] : [];
    const score = computeFspScore(achievements, (c.confirmedSpecialization ?? c.specialization) as Specialization | null, new Date());
    return { linked: Boolean(link), fsp_id: link?.fspId ?? null, verified_at: link?.verifiedAt.toISOString() ?? null,
      has_history: achievements.length > 0, index: score.index, bonus: score.bonus, components: score.components, achievements };
  }
  @Post('link') @HttpCode(200)
  async link(@Req() r: Request, @Body() body: unknown) {
    const data = parse(LinkMyFspBody, body), c = await this.candidate(r.identity);
    await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const fresh = await this.candidate(r.identity, tx);
      if (!fresh.consents.some(x => x.type === 'fsp_data' && !x.revokedAt)) throw new Problem(403, 'consent_required', 'Нужно согласие ФСП', { consent_types: ['fsp_data'] });
      await tx.$queryRaw`SELECT id FROM "FspParticipant" WHERE id = ${data.fsp_id} FOR UPDATE`;
      const participant = await tx.fspParticipant.findUnique({ where: { id: data.fsp_id }, include: { link: true } });
      // The test registry contains operator-provisioned ownership. Arbitrary IDs never grant achievements.
      if (!participant || participant.ownerSubject !== r.identity.sub) throw new Problem(404, 'fsp_not_found', 'ФСП ID не найден или владение не подтверждено');
      if (participant.link && participant.link.candidateId !== c.id) throw new Problem(409, 'fsp_already_linked', 'ФСП ID уже привязан');
      await tx.fspLink.upsert({ where: { candidateId: c.id }, create: { candidateId: c.id, fspId: data.fsp_id }, update: { fspId: data.fsp_id, verifiedAt: new Date() } });
      await tx.candidate.update({ where: { id: c.id }, data: { profile: { ...(fresh.profile as Prisma.JsonObject), fsp_achievements: participant.achievements } as Prisma.InputJsonObject } });
      await tx.audit.create({ data: { actorSubject: r.identity.sub, action: 'fsp.linked', resourceId: c.id, metadata: { provider: 'test-registry' } } });
    });
    return this.get(r);
  }
  @Delete('link')
  async unlink(@Req() r: Request) {
    const c = await this.candidate(r.identity);
    await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: c.id } });
      await tx.fspLink.deleteMany({ where: { candidateId: c.id } });
      await tx.candidate.update({ where: { id: c.id }, data: { profile: { ...(fresh.profile as Prisma.JsonObject), fsp_achievements: [] } as Prisma.InputJsonObject } });
      await tx.audit.create({ data: { actorSubject: r.identity.sub, action: 'fsp.unlinked', resourceId: c.id } });
    });
    return this.get(r);
  }
}

@Controller('webhooks/fsp')
export class FspWebhookController {
  constructor(private readonly db: Database) {}
  @Post() @HttpCode(202)
  async receive(@Req() r: { rawBody?: Buffer }, @Headers('x-fsp-signature') signature: string | undefined, @Body() body: unknown) {
    const secret = process.env.FSP_WEBHOOK_SECRET;
    if (!r.rawBody || !secret || !verifyHmac(r.rawBody, signature, secret)) throw new Problem(401, 'unauthorized', 'Подпись реестра недействительна');
    const data = parse(FspWebhookBody, body), now = new Date(), occurred = new Date(data.occurred_at);
    if (occurred.getTime() > now.getTime() + 300000 || occurred.getTime() < now.getTime() - 86400000) throw new Problem(401, 'unauthorized', 'Срок доставки события истёк');
    const hash = createHash('sha256').update(r.rawBody).digest('hex');
    await this.db.$transaction(async tx => {
      // One lock per participant serialises payload updates and replay checks.
      const initial = await tx.fspParticipant.findUnique({ where: { id: data.fsp_id }, include: { link: true } });
      if (!initial) throw new Problem(422, 'validation_error', 'Участник не найден', { errors: [{ pointer: '/fsp_id', detail: 'Участник отсутствует в реестре' }] });
      // Same lock order as linking: candidate before registry participant.
      const owner = await tx.candidate.findFirst({ where: { user: { subject: initial.ownerSubject } } });
      if (owner) await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${owner.id}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "FspParticipant" WHERE id = ${data.fsp_id} FOR UPDATE`;
      if (await tx.webhookReceipt.findUnique({ where: { hash } })) return;
      const participant = await tx.fspParticipant.findUniqueOrThrow({ where: { id: data.fsp_id }, include: { link: true } });
      const achievements = participant.achievements as unknown as FspAchievement[];
      const existing = achievements.find(a => a.id === data.achievement.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(data.achievement)) throw new Problem(422, 'validation_error', 'Конфликт достижения', { errors: [{ pointer: '/achievement', detail: 'Событие создания конфликтует с существующим достижением' }] });
      const next = existing ? achievements : [...achievements, data.achievement];
      await tx.fspParticipant.update({ where: { id: participant.id }, data: { achievements: next as unknown as Prisma.InputJsonArray } });
      await tx.webhookReceipt.create({ data: { hash, provider: 'fsp' } });
      if (participant.link) {
        const c = await tx.candidate.findUniqueOrThrow({ where: { id: participant.link.candidateId }, include: { consents: true } });
        if (c.consents.some(x => x.type === 'fsp_data' && !x.revokedAt)) await tx.candidate.update({ where: { id: c.id }, data: { profile: { ...(c.profile as Prisma.JsonObject), fsp_achievements: next } as unknown as Prisma.InputJsonObject } });
      }
      await tx.audit.create({ data: { actorSubject: 'fsp-registry', action: 'fsp.achievement.received', resourceId: participant.id } });
    });
  }
}
