drop policy if exists deny_browser_roles on private.provider_secret_refs;
create policy deny_browser_roles on private.provider_secret_refs
for all to anon, authenticated
using (false)
with check (false);
