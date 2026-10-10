import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Capacity } from '../common/capacity.ts';

const capacity = new Capacity(2);
export class ResumeExtractionError extends Error {
  readonly reason: 'busy' | 'unavailable' | 'invalid';
  constructor(reason: 'busy' | 'unavailable' | 'invalid') { super(reason); this.reason = reason; }
}

export function extractResume(buffer: Buffer): Promise<string> {
  const release = capacity.acquire();
  if (!release) return Promise.reject(new ResumeExtractionError('busy'));
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(process.env.PYTHON_BIN ?? 'python', [fileURLToPath(new URL('../../scripts/extract-resume.py', import.meta.url))], {
        windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'], shell: false,
      });
    } catch {
      release();
      reject(new ResumeExtractionError('unavailable'));
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new ResumeExtractionError('invalid')); }, 10000);
    child.on('error', () => { clearTimeout(timer); release(); reject(new ResumeExtractionError('unavailable')); });
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 400000) { child.kill('SIGKILL'); reject(new ResumeExtractionError('invalid')); }
      else chunks.push(chunk);
    });
    child.on('close', code => { clearTimeout(timer); release(); if (code === 0) resolve(Buffer.concat(chunks).toString('utf8')); else reject(new ResumeExtractionError(code === 1 ? 'unavailable' : 'invalid')); });
    child.stdin.on('error', () => undefined);
    child.stdin.end(buffer);
  });
}
