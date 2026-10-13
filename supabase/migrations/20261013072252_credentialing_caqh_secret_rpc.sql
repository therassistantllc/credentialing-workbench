grant usage on schema private to authenticated;
create or replace function private.configure_caqh_secret(p_provider_id uuid, p_secret text) returns boolean language plpgsql security definer set search_path = pg_catalog, public, private, vault, auth as $$
declare v_secret_id uuid; v_role text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  v_role := auth.jwt() -> 'app_metadata' ->> 'role';
  if v_role not in ('admin','credentialing_specialist') then raise exception 'permission denied'; end if;
  if not exists(select 1 from public.providers where id=p_provider_id) then raise exception 'provider not found'; end if;
  if nullif(p_secret,'') is null then raise exception 'secret is required'; end if;
  select vault_secret_id into v_secret_id from private.provider_secret_refs where provider_id=p_provider_id and secret_type='caqh_password';
  if v_secret_id is null then
    v_secret_id := vault.create_secret(p_secret,'provider:'||p_provider_id::text||':caqh','Credentialing Workbench CAQH credential',null);
    insert into private.provider_secret_refs(provider_id,secret_type,vault_secret_id) values(p_provider_id,'caqh_password',v_secret_id);
  else
    perform vault.update_secret(v_secret_id,p_secret,'provider:'||p_provider_id::text||':caqh','Credentialing Workbench CAQH credential',null);
    update private.provider_secret_refs set configured_at=now() where provider_id=p_provider_id and secret_type='caqh_password';
  end if;
  return true;
end;$$;
create or replace function private.has_caqh_secret(p_provider_id uuid) returns boolean language plpgsql security definer stable set search_path = pg_catalog, private, auth as $$
declare v_role text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  v_role := auth.jwt() -> 'app_metadata' ->> 'role';
  if v_role not in ('admin','credentialing_specialist','read_only') then raise exception 'permission denied'; end if;
  return exists(select 1 from private.provider_secret_refs where provider_id=p_provider_id and secret_type='caqh_password');
end;$$;
revoke all on function private.configure_caqh_secret(uuid,text) from public, anon;
revoke all on function private.has_caqh_secret(uuid) from public, anon;
grant execute on function private.configure_caqh_secret(uuid,text) to authenticated;
grant execute on function private.has_caqh_secret(uuid) to authenticated;
create or replace function public.configure_caqh_secret(p_provider_id uuid,p_secret text) returns boolean language sql security invoker set search_path=pg_catalog,private as $$select private.configure_caqh_secret(p_provider_id,p_secret);$$;
create or replace function public.has_caqh_secret(p_provider_id uuid) returns boolean language sql security invoker stable set search_path=pg_catalog,private as $$select private.has_caqh_secret(p_provider_id);$$;
revoke all on function public.configure_caqh_secret(uuid,text) from public, anon;
revoke all on function public.has_caqh_secret(uuid) from public, anon;
grant execute on function public.configure_caqh_secret(uuid,text) to authenticated;
grant execute on function public.has_caqh_secret(uuid) to authenticated;
