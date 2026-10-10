export interface KeycloakDeletionConfig { baseUrl: string; issuer: string; realm: string; clientId: string; clientSecret: string }
export class KeycloakDeletionError extends Error {
  constructor() { super('keycloak_deletion_unavailable'); }
}

/** Idempotent external deletion. No tokens, response bodies or identity in errors. */
export async function deleteKeycloakUser(subject: string, config: KeycloakDeletionConfig, fetcher: typeof fetch = fetch): Promise<void> {
  try {
    const base = new URL(config.baseUrl);
    const issuer = new URL(config.issuer);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash
      || !/^[A-Za-z0-9_-]+$/.test(config.realm) || !config.clientId || !config.clientSecret
      || !subject || subject.length > 200 || subject === '.' || subject === '..') throw new Error();
    const root = base.href.replace(/\/$/, '');
    // Public and internal hosts may differ; the realm and context path must agree.
    if (!['http:', 'https:'].includes(issuer.protocol) || issuer.username || issuer.password || issuer.search || issuer.hash
      || issuer.pathname !== `${base.pathname.replace(/\/$/, '')}/realms/${config.realm}`) throw new Error();
    const tokenResponse = await fetcher(`${root}/realms/${config.realm}/protocol/openid-connect/token`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: config.clientId, client_secret: config.clientSecret }),
    });
    if (!tokenResponse.ok || !tokenResponse.body) { await tokenResponse.body?.cancel(); throw new Error(); }
    const reader = tokenResponse.body.getReader(), chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 65536) { await reader.cancel(); throw new Error(); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const token = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
    if (typeof token.access_token !== 'string' || !token.access_token || token.access_token.length > 20000
      || typeof token.token_type !== 'string' || token.token_type.toLowerCase() !== 'bearer') throw new Error();
    const response = await fetcher(`${root}/admin/realms/${config.realm}/users/${encodeURIComponent(subject)}`, {
      method: 'DELETE', redirect: 'error', signal: AbortSignal.timeout(8000), headers: { Authorization: `Bearer ${token.access_token}` },
    });
    await response.body?.cancel();
    if (response.status !== 204 && response.status !== 404) throw new Error();
  } catch { throw new KeycloakDeletionError(); }
}
