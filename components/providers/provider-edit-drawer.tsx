import { ModalDrawer } from '@/components/shared/modal-drawer';
import { saveProviderForm, updateProvider } from '@/app/actions/providers';
import type { ProviderWorkspace } from '@/lib/types/workbench';

export function ProviderEditDrawer({provider,closeHref}:{provider?:ProviderWorkspace['provider'];closeHref:string}){
  void updateProvider;
  return <ModalDrawer title={provider?'Edit Provider':'Add Provider'} closeHref={closeHref}><form action={saveProviderForm} className="grid gap-4">
    {provider?<input type="hidden" name="id" value={provider.id}/>:null}
    <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">First name<input required name="first_name" defaultValue={provider?.firstName??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label><label className="text-sm font-medium">Last name<input required name="last_name" defaultValue={provider?.lastName??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Degree suffix<input name="degree_suffix" defaultValue={provider?.degreeSuffix??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label><label className="text-sm font-medium">Exact credentials<input name="exact_credentials" defaultValue={provider?.exactCredentials??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label></div>
    <label className="text-sm font-medium">NPI<input name="npi_number" inputMode="numeric" pattern="[0-9]{10}" defaultValue={provider?.npi??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label>
    <label className="text-sm font-medium">CAQH ID<input name="caqh_id" defaultValue={provider?.caqhId??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Email<input type="email" name="email" defaultValue={provider?.email??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label><label className="text-sm font-medium">Phone<input name="phone" defaultValue={provider?.phone??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label></div>
    <label className="text-sm font-medium">Specialties <span className="font-normal text-[var(--text-muted)]">(comma separated)</span><input name="specialties" defaultValue={provider?.specialties.join(', ')??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label>
    <label className="text-sm font-medium">Notes<textarea name="notes" defaultValue={provider?.notes??''} rows={4} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"/></label>
    <button className="rounded-md bg-[var(--brand)] px-4 py-2 font-semibold text-white">{provider?'Save Provider':'Create Provider'}</button>
  </form></ModalDrawer>;
}
