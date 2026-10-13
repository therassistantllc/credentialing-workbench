# Credentialing Workbench Phase 1 Verification

## Deployment target

- Supabase project ref: `mkmqkvahkafdthcmsass`
- Private Storage bucket: `credentialing-documents`
- GitHub target: `therassistantllc/credentialing-workbench`
- Current connector limitation: GitHub access is read-only (`pull: true`, `push: false`), so local commits cannot be pushed until write permission is granted.

## Required environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=https://mkmqkvahkafdthcmsass.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
SUPABASE_SECRET_KEY=<server-only secret key>
BOOTSTRAP_ADMIN_EMAIL=<initial admin email>
BOOTSTRAP_ADMIN_PASSWORD=<initial strong password>
```

Never expose `SUPABASE_SECRET_KEY` or a service-role credential through any `NEXT_PUBLIC_*` variable.

## Initial admin bootstrap

After dependencies are installed and server-only environment variables are configured:

```bash
npm run bootstrap:admin
```

The bootstrap script creates or updates the configured user and stores the authorization role in `app_metadata.role = admin`. Subsequent users must use one of `admin`, `credentialing_specialist`, or `read_only` in `app_metadata`.

## Release verification

```bash
npm test
npm run test:e2e
npm run lint
npm run build
npm run verify:phase1
```

For source-only verification when live server credentials are intentionally unavailable:

```bash
npm run verify:phase1 -- --source-only
```

Source-only mode is not a release substitute; it skips the live Supabase contract.

## Acceptance checklist

- Dashboard links into filtered Provider, Application, and Task queues.
- Provider workspace contains Overview, Payer Credentialing, Credentials, Locations, Documents, Contracts, and Activity.
- Payer Application preserves nullable service agreement linkage and Contract preserves `payer_application_id`.
- Task creation preserves provider/application context.
- Credential expirations and CAQH attestation dates drive deadline states using date-only boundaries.
- CAQH UI displays only `Configured` / `Not Configured`; the secret is stored through Vault-backed RPCs.
- `read_only` can read operational records and signed documents but cannot mutate operational tables or Storage objects.
- Provider records with no related credentials/applications/documents render empty states rather than errors.
- Document links are short-lived signed URLs; raw storage paths are not rendered.

## Supabase prerequisites already applied

The live project has RLS policies on all 15 Phase 1 operational tables, zero `anon` operational table grants, the malpractice provider FK corrected to UUID, plaintext `providers.caqh_password` removed, Vault-backed CAQH secret functions, and provider-scoped private document Storage policies.

## Verification record — 2026-10-13

- Live security contract: PASS — 60 operational policies, zero anonymous operational grants, zero operational tables without RLS, UUID malpractice FK, no `providers.caqh_password`, private document bucket with four object policies.
- Supabase security advisor: zero findings.
- Supabase performance advisor: the 60 RLS initialization-plan findings introduced during implementation were corrected. Remaining findings are 16 unindexed foreign keys that predate this workbench build plus the newly created malpractice FK index reported as unused because the table currently has zero rows.
- RLS simulation: `credentialing_specialist` representative read/write passed inside a rolled-back transaction; `read_only` representative read passed and write was denied.
- Recent Postgres/PostgREST/Storage logs: no matches for `caqh_password`, `sb_secret_`, `service_role`, unexpected row-level-security denial, or permission-denied markers in the inspected verification window.
- Seeded provider Jane Doe renders the important empty-related-record case: zero payer applications, licenses, documents, and open tasks.
- Executable dependency-free checks: 15/15 Node source/date contract tests passed.
- Full Next.js/Vitest/Playwright/lint/build verification is pending because this execution container cannot resolve the npm registry (`EAI_AGAIN`), so dependencies could not be installed. Run the release command set above in a networked environment before deployment.
