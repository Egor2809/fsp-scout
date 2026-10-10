import { PrismaClient } from '@prisma/client';
import { identityTombstone } from '../src/auth/deleted-identity.js';

/** Operator-only CLI. Does not assign Keycloak roles or bypass verified token checks. */
const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i]!, process.argv[i + 1] ?? '');
const subject = args.get('--subject'), email = args.get('--email'), name = args.get('--company');
if (!subject || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subject) || !email?.includes('@') || !name?.trim()) {
  throw new Error('Usage: node --env-file=.env --import tsx scripts/provision-employer.ts --subject KEYCLOAK_USER_UUID --email employer@example.test --company "Company name"');
}
const db = new PrismaClient();
const identityHash = identityTombstone(process.env.OIDC_ISSUER ?? '', subject);
try {
  const companyId = await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${subject}, 0))`;
    if (await tx.deletedIdentity.findUnique({ where: { identityHash } })) throw new Error('Account deletion prevents provisioning');
    const user = await tx.user.upsert({ where: { subject }, create: { subject, email, displayName: email, role: 'employer' }, update: {} });
    if (user.role !== 'employer') throw new Error('Existing user is not an employer; review role assignment first');
    const existing = await tx.membership.findFirst({ where: { userId: user.id } });
    if (existing) return existing.companyId;
    const company = await tx.company.create({ data: { name: name.trim(), details: { contact_email: email, size: '1-50' }, memberships: { create: { userId: user.id } } } });
    await tx.audit.create({ data: { actorSubject: 'operator-cli', action: 'company.provisioned', resourceId: company.id, metadata: { subject } } });
    return company.id;
  });
  console.log(JSON.stringify({ company_id: companyId }));
} finally { await db.$disconnect(); }
