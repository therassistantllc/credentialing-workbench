export const SECURITY_CONTRACT_SQL = `
with phase1(table_name) as (
  values ('providers'),('payers'),('locations'),('provider_locations'),('proposals'),('service_agreements'),('payer_applications'),('contracts'),('licenses'),('dea_registrations'),('sanction_checks'),('employment_history'),('documents'),('tasks'),('malpractice_insurance')
)
select
  (select data_type from information_schema.columns where table_schema='public' and table_name='malpractice_insurance' and column_name='provider_id') as malpractice_provider_type,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='providers' and column_name='caqh_password') as caqh_password_exists,
  exists(select 1 from information_schema.tables where table_schema='private' and table_name='provider_secret_refs') as secret_refs_exists,
  (select count(*) from pg_policies p join phase1 x on p.tablename=x.table_name where p.schemaname='public') as policy_count,
  (select count(*) from information_schema.role_table_grants g join phase1 x on g.table_name=x.table_name where g.table_schema='public' and g.grantee='anon') as anon_grant_count;
`;
