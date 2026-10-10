import { setTimeout as delay } from 'node:timers/promises';

export async function initializePiston(env = process.env, transport = fetch, pause = delay, log = console.log) {
  const execute = new URL(env.PISTON_EXECUTE_URL || 'http://piston:2000/api/v2/execute');
  if (!['http:', 'https:'].includes(execute.protocol) || execute.username || execute.password || execute.search || execute.hash || !execute.pathname.endsWith('/execute')) throw new Error('Неверный адрес Piston');
  const endpoint = path => new URL(path, execute);
  const packages = [
    { language: 'python', version: env.PISTON_PYTHON_VERSION || '3.10.0', runtime: 'python', code: 'print(input())' },
    { language: 'node', version: env.PISTON_JAVASCRIPT_VERSION || '18.15.0', runtime: 'javascript', code: "process.stdout.write(require('fs').readFileSync(0, 'utf8'))" },
  ];
  if (packages.some(pkg => !/^\d+\.\d+\.\d+$/.test(pkg.version))) throw new Error('Нужны точные версии рантаймов Piston');
  const request = async (path, body, timeout = 5000) => {
    const response = await transport(endpoint(path), { method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(timeout),
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new Error(`Piston ${path}: HTTP ${response.status}`);
    return response.json();
  };
  let runtimes;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      runtimes = await request('runtimes');
      if (!Array.isArray(runtimes)) throw new Error('Неверный список рантаймов');
      break;
    } catch (error) {
      if (attempt === 29) throw error;
      await pause(2000);
    }
  }
  for (const pkg of packages) {
    const installed = () => runtimes.some(runtime => runtime.language === pkg.runtime && runtime.version === pkg.version);
    if (!installed()) {
      await request('packages', { language: pkg.language, version: pkg.version }, 300000);
      runtimes = await request('runtimes');
      if (!Array.isArray(runtimes) || !installed()) throw new Error(`Рантайм ${pkg.runtime} ${pkg.version} не установлен`);
    }
    const result = await request('execute', { language: pkg.runtime, version: pkg.version,
      files: [{ content: pkg.code }], stdin: '42\n', args: [], compile_timeout: 10000, run_timeout: 3000,
      compile_memory_limit: 268435456, run_memory_limit: 134217728 }, 15000);
    if (result.language !== pkg.runtime || result.version !== pkg.version || result.run?.code !== 0 || result.run?.signal
      || result.run?.status || result.run?.stdout?.trim() !== '42') throw new Error(`Не работает выполнение ${pkg.runtime} ${pkg.version}`);
    log(`Готов: ${pkg.runtime} ${pkg.version}`);
  }
}

if (import.meta.main) {
  initializePiston().catch(error => {
    console.error(`Инициализация Piston не выполнена: ${error.message}`);
    process.exitCode = 1;
  });
}
