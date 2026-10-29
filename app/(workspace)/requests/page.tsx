import Link from 'next/link';
import {requireRole} from '@/lib/auth/require-role';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {PermissionDenied} from '@/components/shared/permission-denied';
export default async function RequestsPage({searchParams}:{searchParams:Promise<{created?:string;error?:string}>}) {
 const guard=await requireRole(['admin','credentialing_specialist']);
 if(!guard.allowed)return <PermissionDenied/>;
 const p=await searchParams;
 const supabase=await createServerSupabaseClient();
 const {data,error}=await supabase.from('consulting_projects').select('id,service_type,issue_type,claim_count,pricing_tier,quoted_fee,status,created_at,consulting_practices(practice_name,contractor_tracking_code)').order('created_at',{ascending:false}).limit(100);
 return <div className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Consulting requests</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Non-PHI project requests, pricing, and documentation status.</p></div><Link className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white" href="/requests/new">New project request</Link></div>
  {p.created?<div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Request saved. Documentation has not been uploaded or verified; payment is not enabled.</div>:null}
  {p.error?<div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Unable to open that request.</div>:null}
  {error?<div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Unable to load project requests. {error.message}</div>:null}
  <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-muted)]"><tr>{['Practice','Issue','Claims','Service','Proposed fee','Status','Received'].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{(data??[]).map(row=><tr key={row.id}>
   <td className="px-4 py-3 font-semibold">{row.consulting_practices?.practice_name??'Practice'}</td><td className="px-4 py-3 capitalize">{row.issue_type.replaceAll('_',' ')}</td><td className="px-4 py-3">{row.claim_count}</td><td className="px-4 py-3">{row.pricing_tier.replaceAll('_',' ')}</td><td className="px-4 py-3">{row.quoted_fee==null?'Manual review':`$${row.quoted_fee}`}</td><td className="px-4 py-3 capitalize">{row.status.replaceAll('_',' ')}</td><td className="px-4 py-3">{new Date(row.created_at).toLocaleDateString('en-US')}</td>
  </tr>)}</tbody></table>
  {!error && !data?.length?<div className="p-8 text-center text-sm text-[var(--text-muted)]">No consulting requests yet. Start with a new project request.</div>:null}
  </div>
  <p className="text-xs text-[var(--text-muted)]">No claim, insurance card, denial or claim history files are accepted here until a HIPAA-appropriate storage and access workflow is validated.</p>
 </div>;
}