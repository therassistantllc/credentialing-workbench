do $$
begin
  if exists (select 1 from public.providers where caqh_password is not null and caqh_password <> '') then
    raise exception 'Refusing to drop providers.caqh_password while non-empty values exist';
  end if;
end $$;

alter table public.providers drop column if exists caqh_password;
