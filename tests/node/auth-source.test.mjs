import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('auth source uses app_metadata roles and server-only admin credentials', async () => {
  const roles = await readFile(new URL('../../lib/auth/roles.ts', import.meta.url), 'utf8');
  const guard = await readFile(new URL('../../lib/auth/require-role.ts', import.meta.url), 'utf8');
  const admin = await readFile(new URL('../../lib/supabase/admin.ts', import.meta.url), 'utf8');
  const proxy = await readFile(new URL('../../proxy.ts', import.meta.url), 'utf8');
  assert.match(roles, /credentialing_specialist/);
  assert.match(guard, /app_metadata/);
  assert.doesNotMatch(guard, /user_metadata/);
  assert.match(admin, /server-only/);
  assert.match(admin, /SUPABASE_SECRET_KEY/);
  assert.match(proxy, /export async function proxy/);
});
