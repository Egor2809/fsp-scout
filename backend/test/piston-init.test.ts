import test from 'node:test';
import assert from 'node:assert/strict';
import { initializePiston } from '../src/assessment/piston-init.mjs';

const env = { PISTON_EXECUTE_URL: 'http://sandbox/api/v2/execute', PISTON_PYTHON_VERSION: '3.10.0', PISTON_JAVASCRIPT_VERSION: '18.15.0' };
const noPause = async () => {};

test('Piston init installs Python and the node package, verifies execution and skips installed versions', async () => {
  const runtimes: { language: string; version: string }[] = [];
  const installs: unknown[] = [], runs: unknown[] = [];
  const transport = async (url, options) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/runtimes')) return Response.json(runtimes);
    const body = JSON.parse(options.body);
    if (path.endsWith('/packages')) {
      installs.push(body);
      runtimes.push({ language: body.language === 'node' ? 'javascript' : body.language, version: body.version });
      return Response.json(body);
    }
    assert.equal(path, '/api/v2/execute');
    runs.push(body);
    return Response.json({ language: body.language, version: body.version, run: { stdout: '42\n', code: 0, signal: null, status: null } });
  };
  await initializePiston(env, transport, noPause, () => {});
  assert.deepEqual(installs, [{ language: 'python', version: '3.10.0' }, { language: 'node', version: '18.15.0' }]);
  await initializePiston(env, transport, noPause, () => {});
  assert.equal(installs.length, 2);
  assert.equal(runs.length, 4);
});

test('Piston init retries startup but fails visibly on unavailable API or missing runtime', async () => {
  let calls = 0;
  await assert.rejects(initializePiston(env, async () => { calls++; throw new Error('offline'); }, noPause, () => {}), /offline/);
  assert.equal(calls, 30);
  await assert.rejects(initializePiston(env, async (url) => new URL(url).pathname.endsWith('/packages')
    ? Response.json({ message: 'missing' }, { status: 404 }) : Response.json([]), noPause, () => {}), /HTTP 404/);
  await assert.rejects(initializePiston(env, async () => Response.json([]), noPause, () => {}), /не установлен/);
});

test('installed runtimes must execute code successfully before init reports ready', async () => {
  const runtimes = [{ language: 'python', version: '3.10.0' }, { language: 'javascript', version: '18.15.0' }];
  await assert.rejects(initializePiston(env, async (url) => new URL(url).pathname.endsWith('/runtimes')
    ? Response.json(runtimes) : Response.json({ language: 'python', version: '3.10.0', run: { code: 1, stdout: '' } }), noPause, () => {}), /Не работает выполнение/);
  await assert.rejects(initializePiston({ ...env, PISTON_PYTHON_VERSION: '*' }, async () => { assert.fail(); }, noPause), /точные версии/);
});
