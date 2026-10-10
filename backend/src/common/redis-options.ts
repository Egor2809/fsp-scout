/** Shared configuration: a Redis URL database must not silently become database zero. */
export function redisOptions(value: string) {
  const url = new URL(value);
  if (!['redis:', 'rediss:'].includes(url.protocol) || !url.hostname || url.search || url.hash)
    throw new Error('Invalid Redis URL');
  const database = url.pathname.replace(/^\//, '');
  if (database && !/^\d+$/.test(database)) throw new Error('Invalid Redis database');
  const db = database ? Number(database) : 0;
  const port = Number(url.port || 6379);
  if (!Number.isSafeInteger(db) || db < 0 || !Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid Redis connection');
  return { host: url.hostname.replace(/^\[|\]$/g, ''), port, db,
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}), maxRetriesPerRequest: null };
}
