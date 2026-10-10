import test from 'node:test';
import assert from 'node:assert/strict';
import { parseResumeText } from '../src/users/resume-parser.ts';
test('resume extraction reports only actual text facts and never invents employment or confirmed skills', () => {
  const { fields, confidence } = parseResumeText('Python PostgreSQL\nivan@example.com\n+7 (917) 123-45-67\nTelegram: @ivan_dev');
  assert.equal(fields.email, 'ivan@example.com');
  assert.equal(fields.telegram, '@ivan_dev');
  assert.ok(fields.phone);
  assert.ok(fields.skills.some(s => s.skill_id === 'python'));
  assert.equal(fields.full_name, null);
  assert.equal(fields.experience_years, null);
  assert.deepEqual(fields.experience, []);
  assert.ok(Object.values(confidence).every(n => n >= 0 && n <= 1));
});
test('image-only resume yields explicit OCR warning and empty fields', () => {
  const result = parseResumeText('');
  assert.equal(result.fields.email, null);
  assert.deepEqual(result.fields.skills, []);
  assert.ok(result.warnings.some(w => w.includes('OCR')));
});
