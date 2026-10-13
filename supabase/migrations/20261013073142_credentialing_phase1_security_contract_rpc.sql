create or replace function public.phase1_security_contract()
returns jsonb
language sql
security definer
stable
set search_path = pg_catalog, public, storage, information_schema
as $$
with phase1(table_name) as (
  values ('providers'),('payers'),('locations'),('provider_locations'),('proposals'),('service_agreements'),('payer_applications'),('contracts'),('licenses'),('dea_registrations'),('sanction_checks'),('employment_history'),('documents'),('tasks'),('malpractice_insurance')
), policy_text as (
  select coalesce(string_agg(coalesce(p.qual,'') || ' ' || coalesce(p.with_check,''), ' '), '') as body
  from pg_policies p join phase1 x on p.tablename=x.table_name
  where p.schemaname='public'
)
select jsonb_build_object(
  'malpractice_provider_type', (select data_type from information_schema.columns where table_schema='public' and table_name='malpractice_insurance' and column_name='provider_id'),
  'malpractice_has_provider_fk', exists(select 1 from information_schema.table_constraints tc join information_schema.key_column_usage kcu on tc.constraint_name=kcu.constraint_name and tc.constraint_schema=kcu.constraint_schema where tc.table_schema='public' and tc.table_name='malpractice_insurance' and tc.constraint_type='FOREIGN KEY' and kcu.column_name='provider_id'),
  'caqh_password_exists', exists(select 1 from information_schema.columns where table_schema='public' and table_name='providers' and column_name='caqh_password'),
  'operational_policy_count', (select count(*) from pg_policies p join phase1 x on p.tablename=x.table_name where p.schemaname='public'),
  'anon_grant_count', (select count(*) from information_schema.role_table_grants g join phase1 x on g.table_name=x.table_name where g.table_schema='public' and g.grantee='anon'),
  'operational_tables_without_rls', (select count(*) from phase1 x join pg_class c on c.relname=x.table_name join pg_namespace n on n.oid=c.relnamespace and n.nspname='public' where c.relrowsecurity=false),
  'policy_uses_user_metadata', (select position('user_metadata' in body) > 0 from policy_text),
  'storage_bucket_private', coalesce((select not public from storage.buckets where id='credentialing-documents'), false),
  'storage_policy_count', (select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'credentialing_documents_%'),
  'secret_ref_browser_grants', (select count(*) from information_schema.role_table_grants where table_schema='private' and table_name='provider_secret_refs' and grantee in ('anon','authenticated'))
);
$$;
revoke all on function public.phase1_security_contract() from public, anon, authenticated;
grant execute on function public.phase1_security_contract() to service_role;
