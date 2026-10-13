import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const failures: string[] = [];
const sourceOnly = process.argv.includes('--source-only');

async function sourceFiles(dir: string): Promise<string[]> {
  const full = join(root, dir);
  const entries = await readdir(full, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(full, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(relative(root, path)));
    else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

function check(condition: boolean, message: string) { if (!condition) failures.push(message); }

const trackedSources = (await Promise.all(['app', 'components', 'lib'].map(sourceFiles))).flat();
for (const file of trackedSources) {
  const text = await readFile(file, 'utf8');
  check(!/\bcaqh_password\b/.test(text), `${relative(root, file)} exposes forbidden key caqh_password`);
  check(!/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|SERVICE_ROLE|PRIVATE_KEY)/i.test(text), `${relative(root, file)} references a secret-like NEXT_PUBLIC_ variable`);
}
const envExample = await readFile(join(root, '.env.example'), 'utf8');
check(!/^NEXT_PUBLIC_.*(?:SECRET|SERVICE_ROLE|PRIVATE_KEY)/im.test(envExample), '.env.example exposes a secret/service-role credential through NEXT_PUBLIC_');

if (!sourceOnly) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  check(Boolean(url), 'NEXT_PUBLIC_SUPABASE_URL is required for live verification');
  check(Boolean(secret), 'SUPABASE_SECRET_KEY is required for live verification');
  if (url && secret) {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/phase1_security_contract`, {
      method: 'POST', headers: { apikey: secret, 'Content-Type': 'application/json' }, body: '{}',
    });
    check(response.ok, `phase1_security_contract RPC failed with HTTP ${response.status}`);
    if (response.ok) {
      const raw = await response.json();
      const contract = Array.isArray(raw) ? raw[0] : raw;
      check(contract?.malpractice_provider_type === 'uuid', 'malpractice_provider_type must be uuid');
      check(contract?.malpractice_has_provider_fk === true, 'malpractice provider_id FK is missing');
      check(contract?.caqh_password_exists === false, 'database still exposes providers.caqh_password');
      check(Number(contract?.operational_policy_count) >= 60, 'operational_policy_count is below 60');
      check(Number(contract?.anon_grant_count) === 0, 'anon_grant_count must be 0');
      check(Number(contract?.operational_tables_without_rls) === 0, 'one or more operational tables lack RLS');
      check(contract?.policy_uses_user_metadata === false, 'RLS must not authorize from user_metadata');
      check(contract?.storage_bucket_private === true, 'credentialing-documents bucket must be private');
      check(Number(contract?.storage_policy_count) >= 4, 'credentialing document storage policies are incomplete');
      check(Number(contract?.secret_ref_browser_grants) === 0, 'private secret references are browser-accessible');
    }
  }
}

if (failures.length) {
  console.error('Phase 1 verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(sourceOnly ? 'Phase 1 source verification passed (live database checks skipped).' : 'Phase 1 verification passed.');
