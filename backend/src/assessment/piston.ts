import type { CodeLanguage, CodeRunResult, TestItemPublicTests } from '../contract/model/index.js';
import { Capacity } from '../common/capacity.ts';

const capacity = new Capacity(2);
export class JudgeError extends Error {
  readonly reason: 'busy' | 'unavailable' | 'configuration';
  constructor(reason: 'busy' | 'unavailable' | 'configuration') { super(reason); this.reason = reason; }
}
interface Stage { stdout: string; stderr: string; code: number | null; signal: string | null; status?: string | null }
function stage(value: unknown): Stage {
  if (!value || typeof value !== 'object') throw new JudgeError('unavailable');
  const v = value as Record<string, unknown>;
  if (typeof v.stdout !== 'string' || typeof v.stderr !== 'string' || !(v.code === null || Number.isInteger(v.code))
    || !(v.signal === null || typeof v.signal === 'string') || !(v.status === undefined || v.status === null || typeof v.status === 'string')) throw new JudgeError('unavailable');
  return v as unknown as Stage;
}
async function boundedJson(response: Response): Promise<unknown> {
  if (!response.ok || !response.body) throw new JudgeError('unavailable');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 65536) { await reader.cancel(); throw new JudgeError('unavailable'); }
      chunks.push(value);
    }
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!parsed || typeof parsed !== 'object') throw new Error('shape');
    return parsed;
  } catch { throw new JudgeError('unavailable'); }
  finally { reader.releaseLock(); }
}
const normalize = (text: string) => text.replaceAll('\r\n', '\n').trimEnd();

export async function runtimeAvailable(config: { url?: string; version?: string; language: CodeLanguage }, transport: typeof fetch = fetch): Promise<boolean> {
  if (!config.url || !config.version || !/^\d+\.\d+\.\d+$/.test(config.version)) return false;
  try {
    const url = new URL(config.url);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash || url.search || !url.pathname.endsWith('/execute')) return false;
    url.pathname = url.pathname.slice(0, -'execute'.length) + 'runtimes';
    const runtimes = await boundedJson(await transport(url, { redirect: 'error', signal: AbortSignal.timeout(1500) }));
    return Array.isArray(runtimes) && runtimes.some(value => {
      if (!value || typeof value !== 'object') return false;
      const runtime = value as Record<string, unknown>;
      return runtime.language === config.language && runtime.version === config.version;
    });
  } catch { return false; }
}

/** Sends only server-owned open cases to a separately operated Piston sandbox. */
export async function runOpenTests(input: { code: string; language: CodeLanguage; tests: NonNullable<TestItemPublicTests>; deadlineAt: Date },
  config: { url: string; version: string }, transport: typeof fetch = fetch): Promise<CodeRunResult> {
  if (!['python', 'go', 'javascript'].includes(input.language) || !/^\d+\.\d+\.\d+$/.test(config.version)
    || !Number.isFinite(input.deadlineAt.getTime()) || !input.tests.length || input.tests.length > 10 || input.code.length > 20000
    || input.tests.some(t => t.input.length > 20000 || t.expected.length > 20000)) throw new JudgeError('configuration');
  let url: URL;
  try { url = new URL(config.url); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash || url.search) throw new Error(); }
  catch { throw new JudgeError('configuration'); }
  const release = capacity.acquire();
  if (!release) throw new JudgeError('busy');
  const started = Date.now();
  const cases: CodeRunResult['cases'] = [];
  let status: CodeRunResult['status'] = 'ok';
  try {
    for (const test of input.tests) {
      if (status !== 'ok' || Date.now() >= input.deadlineAt.getTime()) {
        if (status === 'ok') status = 'timeout';
        cases.push({ name: test.name, passed: false, actual: null, stderr: null });
        continue;
      }
      const remaining = input.deadlineAt.getTime() - Date.now();
      let payload: Record<string, unknown>;
      try {
        const value = await boundedJson(await transport(url, { method: 'POST', redirect: 'error',
          headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(Math.max(1, Math.min(15000, remaining))),
          body: JSON.stringify({ language: input.language, version: config.version,
            files: [{ name: input.language === 'go' ? 'main.go' : input.language === 'python' ? 'main.py' : 'main.js', content: input.code }],
            stdin: test.input, args: [], compile_timeout: 10000, run_timeout: 3000,
            compile_memory_limit: 268435456, run_memory_limit: 134217728 }) }));
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new JudgeError('unavailable');
        payload = value as Record<string, unknown>;
      } catch { throw new JudgeError('unavailable'); }
      if (payload.language !== input.language || payload.version !== config.version) throw new JudgeError('unavailable');
      const compiled = payload.compile === undefined ? null : stage(payload.compile);
      const selected = compiled && (compiled.code !== 0 || compiled.signal || compiled.status) ? compiled : stage(payload.run);
      if (selected.status === 'XX') throw new JudgeError('unavailable');
      if (selected.status === 'TO') status = 'timeout';
      else if (selected === compiled) status = 'compile_error';
      else if (selected.code !== 0 || selected.signal || selected.status) status = 'runtime_error';
      cases.push({ name: test.name, passed: status === 'ok' && normalize(selected.stdout) === normalize(test.expected),
        actual: selected.stdout.slice(0, 8000), stderr: selected.stderr ? selected.stderr.slice(0, 8000) : null });
    }
    return { status, passed: cases.filter(c => c.passed).length, total: input.tests.length, duration_ms: Date.now() - started, cases };
  } finally { release(); }
}
