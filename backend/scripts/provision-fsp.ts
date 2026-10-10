import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { GetMyFspResponse, LinkMyFspBody } from '../src/contract/schemas.js';
import { identityTombstone } from '../src/auth/deleted-identity.js';

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i]!, process.argv[i + 1] ?? '');
const subject = args.get('--subject'), id = args.get('--fsp-id'), file = args.get('--achievements');
if (!subject || !id) throw new Error('Usage: --subject KEYCLOAK_SUB --fsp-id FSP-77-000001 [--achievements file.json]');
LinkMyFspBody.shape.fsp_id.parse(id);
const achievements: unknown = file ? JSON.parse(readFileSync(file, 'utf8')) : [];
const parsed = GetMyFspResponse.shape.achievements.parse(achievements);
const db = new PrismaClient();
const identityHash = identityTombstone(process.env.OIDC_ISSUER ?? '', subject);
try {
  await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${subject}, 0))`;
    if (await tx.deletedIdentity.findUnique({ where: { identityHash } })) throw new Error('Account deletion prevents provisioning');
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${id}, 0))`;
    const existing = await tx.fspParticipant.findUnique({ where: { id } });
    if (existing && existing.ownerSubject !== subject) throw new Error('Ownership cannot be reassigned by this CLI');
    await tx.fspParticipant.upsert({ where: { id }, create: { id, ownerSubject: subject, achievements: parsed }, update: {} });
    await tx.audit.create({ data: { actorSubject: 'operator-cli', action: 'fsp.test-participant.provisioned', resourceId: id } });
  });
  console.log(JSON.stringify({ provider: 'test-registry', fsp_id: id }));
} finally { await db.$disconnect(); }
