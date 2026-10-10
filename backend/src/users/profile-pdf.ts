import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Capacity } from '../common/capacity.ts';
import { proofTokenHash } from './profile-proof.ts';

const capacity = new Capacity(2);
export class ProfilePdfError extends Error {
  readonly reason: 'busy' | 'unavailable';
  constructor(reason: 'busy' | 'unavailable') { super(reason); this.reason = reason; }
}
export function verificationUrl(base: string, token: string): string {
  const url = new URL(base);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || !proofTokenHash(token))
    throw new Error('Invalid public verification configuration');
  url.pathname = `${url.pathname.replace(/\/$/, '')}/verify/${token}`;
  if (url.href.length > 1000) throw new Error('Public verification URL too long');
  return url.href;
}
export function renderProfilePdf(payload: unknown): Promise<Buffer> {
  const input = Buffer.from(JSON.stringify(payload), 'utf8');
  if (input.length > 200000) return Promise.reject(new ProfilePdfError('unavailable'));
  const release = capacity.acquire();
  if (!release) return Promise.reject(new ProfilePdfError('busy'));
  return new Promise((resolve, reject) => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(process.env.PYTHON_BIN ?? 'python', [fileURLToPath(new URL('../../scripts/render-profile.py', import.meta.url))],
        { windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'], shell: false });
    } catch { release(); reject(new ProfilePdfError('unavailable')); return; }
    const chunks: Buffer[] = [];
    let size = 0, failed = false;
    const fail = () => { failed = true; child.kill('SIGKILL'); reject(new ProfilePdfError('unavailable')); };
    const timer = setTimeout(fail, 10000);
    child.on('error', () => { clearTimeout(timer); failed = true; reject(new ProfilePdfError('unavailable')); });
    child.stdout!.on('data', (chunk: Buffer) => {
      if (failed) return;
      size += chunk.length;
      if (size > 5 * 1024 * 1024) fail(); else chunks.push(chunk);
    });
    child.on('close', code => {
      clearTimeout(timer); release();
      const pdf = Buffer.concat(chunks);
      if (!failed && code === 0 && pdf.subarray(0, 5).toString('ascii') === '%PDF-') resolve(pdf);
      else reject(new ProfilePdfError('unavailable'));
    });
    child.stdin!.on('error', () => undefined);
    child.stdin!.end(input);
  });
}
