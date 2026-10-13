# Credentialing Workbench

Desktop-first credentialing operations workbench backed by Supabase project `mkmqkvahkafdthcmsass`.

## Phase 1 modules

- Dashboard and prioritized credentialing work queue
- Provider workspaces with payer credentialing, credentials, locations, documents, contracts, and activity
- Payer application and contract tracking
- Global task queues and payer reference workspaces
- Private provider-scoped document storage with short-lived signed links
- Role-based access for `admin`, `credentialing_specialist`, and `read_only`
- Vault-backed CAQH secret handling; credential values are never returned to the browser

## Local setup

1. Use Node.js 22 or later.
2. Copy `.env.example` to `.env.local` and configure the Supabase values.
3. Install dependencies with `npm install`.
4. Bootstrap the first administrator with `npm run bootstrap:admin`.
5. Run `npm run dev`.

## Verification

```bash
npm test
npm run test:e2e
npm run lint
npm run build
npm run verify:phase1
```

See `docs/phase1-verification.md` for the live database contract, deployment prerequisites, and acceptance checklist.

Never expose a Supabase secret/service-role key in `NEXT_PUBLIC_*` variables.
