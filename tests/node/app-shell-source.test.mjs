import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('root layout exposes the Credentialing Workbench title and main landmark', async () => {
  const source = await readFile(new URL('../../app/layout.tsx', import.meta.url), 'utf8');
  assert.match(source, /Credentialing Workbench/);
  assert.match(source, /<main/);
});
