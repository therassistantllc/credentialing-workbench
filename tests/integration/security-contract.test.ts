import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const migrations = [
  'supabase/migrations/20261013071645_credentialing_rls_baseline.sql',
  'supabase/migrations/20261013071652_credentialing_malpractice_provider_uuid.sql',
  'supabase/migrations/20261013071657_credentialing_remove_plaintext_caqh_password.sql',
  'supabase/migrations/20261013071734_credentialing_private_secret_refs_deny_policy.sql',
];

describe('security migration contract', () => {
  it('encodes the live database security guarantees', async () => {
    const sql = (await Promise.all(migrations.map((path) => readFile(path, 'utf8')))).join('\n');
    expect(sql).toContain('alter column provider_id type uuid');
    expect(sql).toContain('references public.providers(id) on delete restrict');
    expect(sql).toContain('drop column if exists caqh_password');
    expect(sql).toContain('private.provider_secret_refs');
    expect(sql).toContain("auth.jwt() -> 'app_metadata' ->> 'role'");
    expect(sql).toContain("'read_only'");
    expect(sql).toContain('revoke all on table public.%I from anon, public');
  });
});
