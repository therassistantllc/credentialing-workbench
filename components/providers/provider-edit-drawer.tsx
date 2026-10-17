import { ModalDrawer } from '@/components/shared/modal-drawer';
import { saveClientOnboardingForm, saveProviderForm, updateProvider } from '@/app/actions/providers';
import type { ProviderWorkspace } from '@/lib/types/workbench';

const input='mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2';
const label='text-sm font-medium';
function Section({title,description,children}:{title:string;description?:string;children:React.ReactNode}){
  return <fieldset className="space-y-3 rounded-lg border border-[var(--border)] p-4"><legend className="px-1 text-sm font-semibold">{title}</legend>{description?<p className="text-xs text-[var(--text-muted)]">{description}</p>:null}{children}</fieldset>;
}

function ExistingProviderForm({provider}:{provider:ProviderWorkspace['provider']}){
  void updateProvider;
  return <form action={saveProviderForm} className="grid gap-4">
    <input type="hidden" name="id" value={provider.id}/>
    <div className="grid grid-cols-2 gap-3"><label className={label}>First name<input required name="first_name" defaultValue={provider.firstName} className={input}/></label><label className={label}>Last name<input required name="last_name" defaultValue={provider.lastName} className={input}/></label></div>
    <div className="grid grid-cols-2 gap-3"><label className={label}>Degree suffix<input name="degree_suffix" defaultValue={provider.degreeSuffix??''} className={input}/></label><label className={label}>Exact credentials<input name="exact_credentials" defaultValue={provider.exactCredentials??''} className={input}/></label></div>
    <label className={label}>NPI<input name="npi_number" inputMode="numeric" pattern="[0-9]{10}" defaultValue={provider.npi??''} className={input}/></label>
    <label className={label}>CAQH ID<input name="caqh_id" defaultValue={provider.caqhId??''} className={input}/></label>
    <div className="grid grid-cols-2 gap-3"><label className={label}>Email<input type="email" name="email" defaultValue={provider.email??''} className={input}/></label><label className={label}>Phone<input name="phone" defaultValue={provider.phone??''} className={input}/></label></div>
    <label className={label}>Specialties <span className="font-normal text-[var(--text-muted)]">(comma separated)</span><input name="specialties" defaultValue={provider.specialties.join(', ')} className={input}/></label>
    <label className={label}>Notes<textarea name="notes" defaultValue={provider.notes??''} rows={4} className={input}/></label>
    <button className="rounded-md bg-[var(--brand)] px-4 py-2 font-semibold text-white">Save Provider</button>
  </form>;
}

function NewClientForm({error}:{error?:string}){
  return <form action={saveClientOnboardingForm} className="space-y-5">
    {error?<div role="alert" className="rounded-md border border-[var(--critical-text)] p-3 text-sm text-[var(--critical-text)]">{error}</div>:null}
    <p className="text-sm text-[var(--text-muted)]">Enter the client once. On save, each section is stored in its matching credentialing record.</p>
    <Section title="Client / Provider Information">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>First name<input required name="first_name" className={input}/></label><label className={label}>Last name<input required name="last_name" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Degree suffix<input name="degree_suffix" placeholder="PhD, LCSW, LMFT" className={input}/></label><label className={label}>Exact credentials<input name="exact_credentials" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>NPI<input name="npi_number" inputMode="numeric" pattern="[0-9]{10}" className={input}/></label><label className={label}>Specialties<input name="specialties" placeholder="Comma separated" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Email<input type="email" name="email" className={input}/></label><label className={label}>Phone<input name="phone" className={input}/></label></div>
    </Section>
    <Section title="Practice / Location" description="Optional. This creates and links the client's primary practice location.">
      <label className={label}>Practice / location name<input name="location_name" placeholder="Primary Practice" className={input}/></label>
      <label className={label}>Address<input name="address_line1" className={input}/></label>
      <label className={label}>Address line 2<input name="address_line2" className={input}/></label>
      <div className="grid gap-3 sm:grid-cols-3"><label className={label}>City<input name="city" className={input}/></label><label className={label}>State<input name="location_state" maxLength={2} className={input}/></label><label className={label}>ZIP<input name="zip_code" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Practice phone<input name="location_phone" className={input}/></label><label className={label}>Fax<input name="fax" className={input}/></label></div>
    </Section>
    <Section title="License" description="Optional. Complete all required license fields to create the first license record.">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>License type<input name="license_type" className={input}/></label><label className={label}>License number<input name="license_number" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-3"><label className={label}>State<input name="license_state" maxLength={2} className={input}/></label><label className={label}>Expiration<input type="date" name="license_expiration_date" className={input}/></label><label className={label}>Status<select name="license_status" defaultValue="Active" className={input}><option>Active</option><option>Inactive</option><option>Pending</option></select></label></div>
    </Section>
    <Section title="CAQH">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>CAQH ID<input name="caqh_id" className={input}/></label><label className={label}>CAQH username<input name="caqh_username" autoComplete="off" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Last attestation<input type="date" name="caqh_last_attestation_date" className={input}/></label><label className={label}>Next attestation<input type="date" name="caqh_next_attestation_date" className={input}/></label></div>
      <label className={label}>MFA routing note<input name="mfa_routing_note" placeholder="Where verification codes are routed" className={input}/></label>
    </Section>
    <Section title="Malpractice" description="Optional. If used, complete carrier, policy number, effective date, and expiration date.">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Carrier<input name="malpractice_carrier" className={input}/></label><label className={label}>Policy number<input name="malpractice_policy_number" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Effective date<input type="date" name="malpractice_effective_date" className={input}/></label><label className={label}>Expiration date<input type="date" name="malpractice_expiration_date" className={input}/></label></div>
    </Section>
    <Section title="DEA / CSR">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>DEA number<input name="dea_number" className={input}/></label><label className={label}>DEA expiration<input type="date" name="dea_expiration_date" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>State CSR number<input name="state_csr_number" className={input}/></label><label className={label}>CSR expiration<input type="date" name="state_csr_expiration_date" className={input}/></label></div>
    </Section>
    <Section title="Employment / Background" description="Optional. A start date is required when this section is used.">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Employer<input name="employer_name" className={input}/></label><label className={label}>Position<input name="position_title" className={input}/></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Start date<input type="date" name="employment_start_date" className={input}/></label><label className={label}>End date<input type="date" name="employment_end_date" className={input}/></label></div>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="is_work_gap"/>This entry represents a work gap</label>
      <label className={label}>Gap explanation<textarea name="gap_explanation" rows={2} className={input}/></label>
    </Section>
    <Section title="Notes"><textarea name="notes" rows={4} className={input}/></Section>
    <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3"><button className="rounded-md bg-[var(--brand)] px-5 py-2 font-semibold text-white">Create Client</button></div>
  </form>;
}

export function ProviderEditDrawer({provider,closeHref,error}:{provider?:ProviderWorkspace['provider'];closeHref:string;error?:string}){
  return <ModalDrawer title={provider?'Edit Provider':'Add Client'} closeHref={closeHref} wide={!provider}>{provider?<ExistingProviderForm provider={provider}/>:<NewClientForm error={error}/>}</ModalDrawer>;
}
