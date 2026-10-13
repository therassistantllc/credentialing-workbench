do $$
declare
  t text;
  phase1_tables text[] := array['providers','payers','locations','provider_locations','proposals','service_agreements','payer_applications','contracts','licenses','dea_registrations','sanction_checks','employment_history','documents','tasks','malpractice_insurance'];
  read_predicate text := $pred$(((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist','read_only'))$pred$;
  write_predicate text := $pred$(((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist'))$pred$;
begin
  foreach t in array phase1_tables loop
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

alter table private.provider_secret_refs drop constraint if exists provider_secret_refs_provider_id_secret_type_key;
alter table private.provider_secret_refs add primary key (provider_id, secret_type);

drop policy if exists credentialing_documents_select on storage.objects;
drop policy if exists credentialing_documents_insert on storage.objects;
drop policy if exists credentialing_documents_update on storage.objects;
drop policy if exists credentialing_documents_delete on storage.objects;

create policy credentialing_documents_select on storage.objects
for select to authenticated
using (bucket_id = 'credentialing-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist','read_only') and (storage.foldername(name))[1] = 'provider' and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2]));
create policy credentialing_documents_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'credentialing-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist') and (storage.foldername(name))[1] = 'provider' and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2]));
create policy credentialing_documents_update on storage.objects
for update to authenticated
using (bucket_id = 'credentialing-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist') and (storage.foldername(name))[1] = 'provider' and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2]))
with check (bucket_id = 'credentialing-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist') and (storage.foldername(name))[1] = 'provider' and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2]));
create policy credentialing_documents_delete on storage.objects
for delete to authenticated
using (bucket_id = 'credentialing-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist') and (storage.foldername(name))[1] = 'provider' and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2]));
