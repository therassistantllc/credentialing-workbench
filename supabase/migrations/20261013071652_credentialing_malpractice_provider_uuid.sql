do $$
begin
  if exists (select 1 from public.malpractice_insurance) then
    raise exception 'malpractice_insurance must be empty before converting provider_id to uuid';
  end if;
end $$;

alter table public.malpractice_insurance
  alter column provider_id type uuid using null::uuid;

alter table public.malpractice_insurance
  add constraint malpractice_insurance_provider_id_fkey
  foreign key (provider_id) references public.providers(id) on delete restrict;

create index if not exists malpractice_insurance_provider_id_idx
  on public.malpractice_insurance(provider_id);

do $$
declare seq_name text;
begin
  select pg_get_serial_sequence('public.malpractice_insurance', 'id') into seq_name;
  if seq_name is not null then
    execute format('revoke all on sequence %s from anon, public', seq_name);
    execute format('grant usage, select on sequence %s to authenticated', seq_name);
  end if;
end $$;
