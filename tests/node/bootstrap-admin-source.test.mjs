import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (path) => {
  try { return await readFile(new URL(`../../${path}`, import.meta.url), 'utf8'); }
  catch { return ''; }
};

test('first-admin bootstrap is server-only and self-disables after a user exists', async () => {
  const [admin, action, page, proxy] = await Promise.all([
    read('lib/supabase/admin.ts'),
    read('app/actions/bootstrap-admin.ts'),
    read('app/(auth)/setup-admin/page.tsx'),
    read('proxy.ts'),
  ]);
  assert.match(admin, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(action, /auth\.admin\.listUsers/);
  assert.match(action, /users\.length/);
  assert.match(action, /auth\.admin\.createUser/);
  assert.match(action, /email_confirm:\s*true/);
  assert.match(action, /app_metadata:\s*\{\s*role:\s*['"]admin['"]/);
  assert.match(page, /Create first administrator/);
  assert.match(page, /type="password"/);
  assert.match(proxy, /setup-admin/);
});
