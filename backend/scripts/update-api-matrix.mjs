import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRoot = resolve(root, 'backend/src');
const normalize = path => path.replace(/:[^/]+|\{[^}]+\}/g, '{parameter}').replace(/\/$/, '') || '/';
const sourceRoutes = new Map();
function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'contract') visit(path); continue; }
    if (!entry.name.endsWith('.ts')) continue;
    const text = readFileSync(path, 'utf8');
    const classes = [...text.matchAll(/@Controller\((?:'([^']*)')?\)/g)];
    for (let i = 0; i < classes.length; i++) {
      const prefix = classes[i][1] ?? '';
      const body = text.slice(classes[i].index, classes[i + 1]?.index ?? text.length);
      for (const match of body.matchAll(/@(Get|Post|Put|Patch|Delete)\((?:'([^']*)')?\)/g)) {
        const endpoint = '/' + [prefix, match[2]].filter(Boolean).join('/');
        sourceRoutes.set(`${match[1].toUpperCase()} ${normalize(endpoint)}`, path.slice(root.length + 1).replaceAll('\\', '/'));
      }
    }
  }
}
visit(sourceRoot);
const contract = JSON.parse(readFileSync(resolve(root, 'backend/src/contract/openapi.json'), 'utf8'));
const rows = ['# API implementation matrix', '', 'A source route is not proof of working integration or complete business rules.', '', '| Method | Path | operationId | Source | Status |', '|---|---|---|---|---|'];
let count = 0, total = 0;
for (const [path, item] of Object.entries(contract.paths)) {
  for (const [method, op] of Object.entries(item)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    const source = sourceRoutes.get(`${method.toUpperCase()} ${normalize(path)}`);
    count += Number(Boolean(source)); total++;
    rows.push(`| ${method.toUpperCase()} | \`${path}\` | \`${op.operationId}\` | ${source ? `\`${source}\`` : '-'} | ${source ? 'source present; integration pending' : 'pending implementation'} |`);
  }
}
writeFileSync(resolve(root, 'docs/api-matrix.md'), rows.join('\n') + '\n');
console.log(`Contract routes with source: ${count}/${total}. Runtime verification is pending.`);
