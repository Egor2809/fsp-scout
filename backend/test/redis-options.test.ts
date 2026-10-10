import test from 'node:test';
import assert from 'node:assert/strict';
import { redisOptions } from '../src/common/redis-options.ts';

test('Redis URL preserves database, TLS, IPv6 and percent-encoded authentication', () => {
  assert.deepEqual(redisOptions('rediss://worker:p%40ss@[::1]:6380/2'), {
    host: '::1', port: 6380, db: 2, username: 'worker', password: 'p@ss', tls: {}, maxRetriesPerRequest: null,
  });
  assert.equal(redisOptions('redis://localhost').db, 0);
  for (const url of ['http://localhost', 'redis://localhost/-1', 'redis://localhost/1.5', 'redis://localhost/1/2',
    'redis://localhost/9007199254740992', 'redis://localhost/1?db=2', 'redis://localhost/1#x'])
    assert.throws(() => redisOptions(url));
});
