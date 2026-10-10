import type { IncomingMessage } from 'node:http';

export function isRankingJson(request: Pick<IncomingMessage, 'url' | 'method' | 'headers'>): boolean {
  const path = (request.url ?? '').split('?')[0]!.replace(/\/$/, '');
  const contentType = request.headers['content-type']?.split(';')[0]?.trim().toLowerCase();
  return request.method === 'POST' && path === '/api/v1/eval/rank' && contentType === 'application/json';
}
export function isOrdinaryJson(request: Pick<IncomingMessage, 'url' | 'method' | 'headers'>): boolean {
  return !isRankingJson(request) && request.headers['content-type']?.split(';')[0]?.trim().toLowerCase() === 'application/json';
}
