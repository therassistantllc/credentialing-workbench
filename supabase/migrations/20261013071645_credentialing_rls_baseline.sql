create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.provider_secret_refs (
  provider_id uuid not null references public.providers(id) on delete restrict,
  secret_type text not null,
  vault_secret_id uuid not null,
  configured_at timestamptz not null default now(),
  unique (provider_id, secret_type)
);
alter table private.provider_secret_refs enable row level security;
revoke all on table private.provider_secret_refs from public, anon, authenticated;

do $$
declare
  t text;
  phase1_tables text[] := array['providers','payers','locations','provider_locations','proposals','service_agreements','payer_applications','contracts','licenses','dea_registrations','sanction_checks','employment_history','documents','tasks','malpractice_insurance'];
  read_predicate text := $pred$((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist','read_only'))$pred$;
  write_predicate text := $pred$((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist'))$pred$;
begin
  foreach t in array phase1_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, public', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists workbench_select on public.%I', t);
    execute format('drop policy if exists workbench_insert on public.%I', t);
    execute format('drop policy if exists workbench_update on public.%I', t);
    execute format('drop policy if exists workbench_delete on public.%I', t);
    execute format('create policy workbench_select on public.%I for select to authenticated using (%s)', t, read_predicate);
    execute format('create policy workbench_insert on public.%I for insert to authenticated with check (%s)', t, write_predicate);
    execute format('create policy workbench_update on public.%I for update to authenticated using (%s) with check (%s)', t, write_predicate, write_predicate);
    execute format('create policy workbench_delete on public.%I for delete to authenticated using (%s)', t, write_predicate);
  end loop;
end $$;

alter function public.update_modified_column() set search_path = public, pg_temp;
