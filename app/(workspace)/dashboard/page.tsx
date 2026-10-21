import Link from 'next/link';
import {createServerSupabaseClient} from '@/lib/supabase/server';
export default async function DashboardPage() {
 const supabase=await createServerSupabaseClient();
 const {data,error}=await supabase.from('consulting_projects').select('status,quoted_fee,service_type').limit(500);
 const rows=data??[];
 const metrics=[
  {name:'Project requests',value:rows.length},
  {name:'Awaiting documents',value:rows.filter(r=>r.status==='documentation_pending').length},
  {name:'Manual scope review',value:rows.filter(r=>r.status==='scope_review').length},
  {name:'Completed reports',value:rows.filter(r=>r.status==='completed').length}
 ];
 return <div className="space-y-6"><div className="border-b border-[var(--border)] pb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#266144]">THERASSISTANT</p><h1 className="mt-2 text-3xl font-bold">Consulting Dashboard</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">On-demand revenue cycle investigations and packaged Health Checks for mental health practices. All services deliver findings and recommendations, not claim corrections.</p></div>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m=><div className="rounded-xl border border-[var(--border)] bg-white p-5" key={m.name}><p className="text-sm text-[var(--text-muted)]">{m.name}</p><p className="mt-2 text-3xl font-bold">{m.value}</p></div>)}</div>
 {error?<p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">Unable to read consulting requests: {error.message}</p>:null}
 <div className="grid gap-4 md:grid-cols-2"><Link href="/requests/new" className="rounded-xl border border-[#cee1d4] bg-[#edf7ef] p-6"><h2 className="text-lg font-semibold text-[#195b3e]">Start a consulting request →</h2><p className="mt-2 text-sm text-[#315f49]">One to ten related claims: $19, $39, $59, or $99. Price is preliminary until documents and scope are validated.</p></Link><Link href="/health-checks" className="rounded-xl border border-[var(--border)] bg-white p-6"><h2 className="text-lg font-semibold">Browse Health Checks →</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Package-based assessments for larger and more complex investigations.</p></Link></div>
 <section className="rounded-xl border border-[var(--border)] bg-white p-5"><h2 className="font-semibold">Required documentation</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Submitted claim • front and back of insurance card • denial or EOB/ERA • claim history</p><p className="mt-3 text-sm text-amber-800">Patient-document uploads and Square checkout are not enabled in this stage. Payment must remain blocked until secure upload, validation, and checkout are connected.</p></section>
 </div>
}