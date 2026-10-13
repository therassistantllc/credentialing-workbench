import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const paths = [
  '../../supabase/migrations/20261013071645_credentialing_rls_baseline.sql',
  '../../supabase/migrations/20261013071652_credentialing_malpractice_provider_uuid.sql',
  '../../supabase/migrations/20261013071657_credentialing_remove_plaintext_caqh_password.sql',
  '../../supabase/migrations/20261013071734_credentialing_private_secret_refs_deny_policy.sql',
];
test('security migrations protect operational data and secrets', async () => {
  const sql = (await Promise.all(paths.map((p) => readFile(new URL(p, import.meta.url), 'utf8')))).join('\n');
  assert.match(sql, /alter column provider_id type uuid/);
  assert.match(sql, /drop column if exists caqh_password/);
  assert.match(sql, /private\.provider_secret_refs/);
  assert.match(sql, /app_metadata/);
  assert.match(sql, /read_only/);
  assert.match(sql, /revoke all on table public\.%I from anon/);
});
