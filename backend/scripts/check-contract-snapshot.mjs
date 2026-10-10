import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = path => readFileSync(resolve(root, path), 'utf8').replaceAll('\r\n', '\n');
const failures = [];
const hash = createHash('sha256').update(readFileSync(resolve(root, 'contracts/openapi.yaml'))).digest('hex');
if (hash !== read('backend/src/contract/openapi.sha256').trim()) failures.push('Canonical OpenAPI JSON snapshot is stale');
if (read('frontend/src/api/generated/zod/scout.zod.ts') !== read('backend/src/contract/schemas.ts')) failures.push('Zod schema snapshot differs');
const front = readdirSync(resolve(root, 'frontend/src/api/generated/model')).filter(name => name.endsWith('.ts'));
const back = readdirSync(resolve(root, 'backend/src/contract/model')).filter(name => name.endsWith('.ts'));
if (JSON.stringify([...front].sort()) !== JSON.stringify([...back].sort())) failures.push('Contract model file inventory differs');
for (const name of front) {
  const expected = read(`frontend/src/api/generated/model/${name}`).replace(/from '(\.\/[^']+)'/g, (_, path) => `from '${path}.js'`);
  if (expected !== read(`backend/src/contract/model/${name}`)) failures.push(`Contract model differs: ${name}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Contract snapshots match: Zod schemas and ${front.length} type files. This is not a runtime API conformance test.`);
