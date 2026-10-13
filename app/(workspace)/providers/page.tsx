import { getProviders } from '@/lib/queries/providers';
import { daysBetweenDateOnly, todayDateOnly } from '@/lib/dates/deadlines';
import { ProviderTable } from '@/components/providers/provider-table';
import { ProviderEditDrawer } from '@/components/providers/provider-edit-drawer';

export default async function ProvidersPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const params=await searchParams;
  const all=await getProviders();
  const today=todayDateOnly();
  const q=(params.q??'').toLowerCase();
  const expiration=Number(params.expiration||0);
  const providers=all.filter(p=>{
    if(q && ![p.name,p.npi,p.caqhId,...p.specialties].filter(Boolean).some(v=>String(v).toLowerCase().includes(q))) return false;
    if(params.credential && params.credential!=='All' && !p.credentialTypes.includes(params.credential)) return false;
    if(params.specialty && !p.specialties.includes(params.specialty)) return false;
    if(params.applicationStatus && !p.applicationStatuses.includes(params.applicationStatus)) return false;
    if(params.payer && !p.payerNames.includes(params.payer)) return false;
    if(params.missing==='any' && !p.missingCredentials.length) return false;
    if(params.missing && params.missing!=='any' && !p.missingCredentials.includes(params.missing)) return false;
    if(expiration && !p.credentialDeadlines.some(d=>{const days=daysBetweenDateOnly(d.date,today);return days>=0&&days<=expiration;})) return false;
    if(params.recred==='due' && !p.recredentialingDue) return false;
    return true;
  });
  const specialties=[...new Set(all.flatMap(p=>p.specialties))].sort();
  const statuses=[...new Set(all.flatMap(p=>p.applicationStatuses))].sort();
  const payers=[...new Set(all.flatMap(p=>p.payerNames))].sort();
  const missing=[...new Set(all.flatMap(p=>p.missingCredentials))].sort();
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Providers</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Credentialing readiness and payer enrollment by provider.</p></div><a href="/providers?new=1" className="rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white">Add provider</a></div>
    <form className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-4 xl:grid-cols-8">
      <label className="text-xs font-semibold">Search<input name="q" defaultValue={params.q} placeholder="Name, NPI, CAQH, specialty" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"/></label>
      <label className="text-xs font-semibold">Credential type<select name="credential" defaultValue={params.credential??'All'} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option>All</option><option>License</option><option>Malpractice</option><option>DEA / CSR</option><option>CAQH</option></select></label>
      <label className="text-xs font-semibold">Specialty<select name="specialty" defaultValue={params.specialty??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">All</option>{specialties.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-xs font-semibold">Application status<select name="applicationStatus" defaultValue={params.applicationStatus??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">All</option>{statuses.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-xs font-semibold">Payer<select name="payer" defaultValue={params.payer??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">All</option>{payers.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-xs font-semibold">Missing credentials<select name="missing" defaultValue={params.missing??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">Any</option><option value="any">Any missing</option>{missing.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-xs font-semibold">Expiration<select name="expiration" defaultValue={params.expiration??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">Any</option><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></label>
      <label className="text-xs font-semibold">Recredentialing<select name="recred" defaultValue={params.recred??''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">Any</option><option value="due">Due / approaching</option></select></label>
      <div className="flex items-end md:col-span-4 xl:col-span-8"><button className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold">Apply filters</button><a href="/providers" className="ml-2 px-3 py-2 text-sm text-[var(--text-muted)]">Clear</a></div>
    </form>
    <ProviderTable providers={providers}/>
    {params.new==='1'?<ProviderEditDrawer closeHref="/providers"/>:null}
  </div>;
}
