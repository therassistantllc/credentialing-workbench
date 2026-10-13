insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('credentialing-documents', 'credentialing-documents', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists credentialing_documents_select on storage.objects;
drop policy if exists credentialing_documents_insert on storage.objects;
drop policy if exists credentialing_documents_update on storage.objects;
drop policy if exists credentialing_documents_delete on storage.objects;

create policy credentialing_documents_select on storage.objects
for select to authenticated
using (
  bucket_id = 'credentialing-documents'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist','read_only')
  and (storage.foldername(name))[1] = 'provider'
  and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2])
);

create policy credentialing_documents_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'credentialing-documents'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist')
  and (storage.foldername(name))[1] = 'provider'
  and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2])
);

create policy credentialing_documents_update on storage.objects
for update to authenticated
using (
  bucket_id = 'credentialing-documents'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist')
  and (storage.foldername(name))[1] = 'provider'
  and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2])
)
with check (
  bucket_id = 'credentialing-documents'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist')
  and (storage.foldername(name))[1] = 'provider'
  and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2])
);

create policy credentialing_documents_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'credentialing-documents'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','credentialing_specialist')
  and (storage.foldername(name))[1] = 'provider'
  and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2])
);
