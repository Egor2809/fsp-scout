import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Problem } from '../common/problem.js';
import { Database } from '../database/database.service.js';
import { identityTombstone } from './deleted-identity.js';

export interface Identity { sub: string; email: string; name: string; role: 'candidate' | 'employer' | 'admin' }

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly issuer = process.env.OIDC_ISSUER;
  private readonly audience = process.env.OIDC_AUDIENCE;
  private readonly jwks;
  constructor(private readonly db: Database) {
    if (!this.issuer || !this.audience || !process.env.OIDC_JWKS_URL) throw new Error('OIDC configuration is required');
    this.jwks = createRemoteJWKSet(new URL(process.env.OIDC_JWKS_URL), { timeoutDuration: 5000 });
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) throw new Problem(401, 'unauthorized', 'Требуется вход');
    try {
      const { payload } = await jwtVerify(header.slice(7), this.jwks, {
        issuer: this.issuer, audience: this.audience, algorithms: ['RS256'], requiredClaims: ['sub', 'exp'],
      });
      const realm = payload.realm_access as { roles?: unknown } | undefined;
      const roles = Array.isArray(realm?.roles) ? realm.roles : [];
      const role = (['admin', 'employer', 'candidate'] as const).find(value => roles.includes(value));
      if (!payload.sub || !role || typeof payload.email !== 'string' || payload.email_verified !== true) throw new Error('Invalid identity');
      request.identity = { sub: payload.sub, email: payload.email, name: typeof payload.name === 'string' ? payload.name : payload.email, role } satisfies Identity;
    } catch { throw new Problem(401, 'unauthorized', 'Недействительный токен или неподтверждённый email'); }
    if (await this.db.deletedIdentity.findUnique({ where: { identityHash: identityTombstone(this.issuer!, request.identity.sub) } }))
      throw new Problem(401, 'unauthorized', 'Аккаунт удалён или ожидает удаления');
    return true;
  }
}
