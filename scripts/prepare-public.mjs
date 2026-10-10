import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const origin = process.argv[2];
const url = new URL(origin);
if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password) {
  throw new Error('Use an HTTPS origin without a trailing slash, e.g. https://scout.example.org');
}
const realm = JSON.parse(readFileSync(new URL('../infra/keycloak/scout-realm.json', import.meta.url), 'utf8'));
const client = realm.clients.find(c => c.clientId === 'scout-frontend');
client.redirectUris = [`${origin}/auth/callback`];
client.webOrigins = [origin];
client.attributes['post.logout.redirect.uris'] = origin;
mkdirSync(new URL('../infra/keycloak-public/', import.meta.url), { recursive: true });
writeFileSync(new URL('../infra/keycloak-public/scout-realm.json', import.meta.url), JSON.stringify(realm, null, 2) + '\n');
console.log('Public realm prepared. Existing realms must be updated through Keycloak administration.');
