import test from 'node:test';
import assert from 'node:assert/strict';
import { isOrdinaryJson, isRankingJson } from '../src/common/body-limits.ts';

test('large body parser is restricted to the ranking JSON route, including query and trailing slash', () => {
  const req = { method: 'POST', url: '/api/v1/eval/rank', headers: { 'content-type': 'application/json; charset=utf-8' } };
  assert.equal(isRankingJson(req), true);
  assert.equal(isOrdinaryJson(req), false);
  assert.equal(isRankingJson({ ...req, url: '/api/v1/eval/rank/?x=1' }), true);
  for (const url of ['/api/v1/me/profile', '/api/v1/eval/rank/other', '/api/v1/eval/ranking']) {
    assert.equal(isRankingJson({ ...req, url }), false);
    assert.equal(isOrdinaryJson({ ...req, url }), true);
  }
  assert.equal(isRankingJson({ ...req, method: 'GET' }), false);
  assert.equal(isRankingJson({ ...req, headers: { 'content-type': 'multipart/form-data' } }), false);
});
