import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redactContactText } from '../src/common/contact-redaction.ts';

test('personal values are treated literally and generic contact forms are removed', () => {
  const text = 'Иван Петров, ООО [Фирма], ivan@example.test, +7 (999) 123-45-67, @ivan_developer. Go PostgreSQL.';
  const result = redactContactText(text, ['Иван Петров', 'ООО [Фирма]'])!;
  assert.ok(!result.includes('Иван Петров'));
  assert.ok(!result.includes('ООО [Фирма]'));
  assert.ok(!result.includes('example.test'));
  assert.ok(!result.includes('999'));
  assert.ok(!result.includes('@ivan_developer'));
  assert.match(result, /Go PostgreSQL/);
  assert.equal(redactContactText(null, []), null);
});
