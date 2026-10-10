import test from 'node:test';
import assert from 'node:assert/strict';
import { runOpenTests, JudgeError } from '../src/assessment/piston.ts';
const input = { code: 'print(input())', language: 'python' as const, tests: [{ name: 'open', input: '42', expected: '42\n' }], deadlineAt: new Date(Date.now() + 60000) };
const config = { url: 'http://sandbox/api/v2/execute', version: '3.12.0' };
const stage = { stdout: '42\n', stderr: '', code: 0, signal: null };
const reply = (value: object) => Response.json({ language: 'python', version: config.version, ...value });
test('judge sends only configured code/input and checks actual output rather than trusting exit status', async () => {
  let body;
  const transport = async (url, options) => { assert.equal(String(url), config.url); assert.equal(options.redirect, 'error'); body = JSON.parse(options.body); return reply({ run: stage }); };
  const result = await runOpenTests(input, config, transport as typeof fetch);
  assert.equal(result.passed, 1);
  assert.equal(body.stdin, '42');
  assert.equal(body.version, '3.12.0');
  assert.equal(body.run_timeout, 3000);
  assert.equal(Object.hasOwn(body, 'expected'), false);
  const wrong = await runOpenTests(input, config, (async () => reply({ run: { ...stage, stdout: 'wrong' } })) as typeof fetch);
  assert.equal(wrong.status, 'ok');
  assert.equal(wrong.passed, 0);
});
test('compile, timeout and unavailable judge are distinct and no missing case becomes a pass', async () => {
  const compile = await runOpenTests({ ...input, tests: [...input.tests, { ...input.tests[0], name: 'second' }] }, config,
    (async () => reply({ compile: { ...stage, code: 1, stderr: 'syntax' } })) as typeof fetch);
  assert.equal(compile.status, 'compile_error');
  assert.equal(compile.passed, 0);
  assert.equal(compile.cases[1].actual, null);
  const timeout = await runOpenTests(input, config, (async () => reply({ run: { ...stage, code: null, signal: 'SIGKILL', status: 'TO' } })) as typeof fetch);
  assert.equal(timeout.status, 'timeout');
  await assert.rejects(runOpenTests(input, config, (async () => Response.json({ run: {} })) as typeof fetch), JudgeError);
  await assert.rejects(runOpenTests(input, config, (async () => reply({ run: stage, version: '0.0.0' })) as typeof fetch), JudgeError);
  await assert.rejects(runOpenTests(input, { ...config, version: '*' }), JudgeError);
  await assert.rejects(runOpenTests(input, config, (async () => new Response('x'.repeat(70000))) as typeof fetch), JudgeError);
});
