'use client';

import {useState} from 'react';
import {createConsultingRequest} from '@/app/actions/consulting';
import {calculateConsultingQuote,HEALTH_CHECKS,type IssueType} from '@/lib/consulting/pricing';

export function RequestForm({defaultPackage='',error}:{defaultPackage?:string;error?:string}) {
 const [count,setCount]=useState('1');
 const [issue,setIssue]=useState<IssueType>('denial');
 const [related,setRelated]=useState('yes');
 const [packageKey,setPackageKey]=useState(defaultPackage);
 const parsedCount=Number(count);
 const quote=calculateConsultingQuote({claimCount:parsedCount,related:related==='yes',issueType:issue,packageKey});
 const packageRequired=Number.isFinite(parsedCount)&&parsedCount>10;
 const needsPackage=packageRequired||Boolean(packageKey);
 const input='mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)]';
 const field='block text-sm font-semibold text-[var(--text)]';
 return <form action={createConsultingRequest} className="mx-auto grid max-w-3xl gap-5 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm md:p-7">
  <div><h1 className="text-2xl font-semibold">New consulting request</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Collect the problem details, select the appropriate service, and prepare a quoted review. THERASSISTANT provides investigation and recommendations only.</p></div>
  {error?<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">The request could not be saved. Check the required fields and selected Health Check package.</p>:null}
  <div className="grid gap-4 md:grid-cols-2">
   <label className={field}>Practice name<input className={input} name="practice" required minLength={2} maxLength={150} placeholder="Practice or group name"/></label>
   <label className={field}>Practice contact email<input className={input} type="email" name="email" placeholder="Optional"/></label>
   <label className={field}>Contractor tracking number<input className={input} name="contractorCode" maxLength={80} placeholder="If referred"/></label>
   <label className={field}>Issue category<select className={input} name="issueType" value={issue} onChange={e=>setIssue(e.target.value as IssueType)}>
    <option value="denial">Claim denial</option><option value="rejection">Claim rejection</option>
    <option value="network">Out-of-network processing</option><option value="payment">Incorrect reimbursement / recoupment</option>
    <option value="credentialing">Credentialing / enrollment issue</option><option value="other">Other billing question</option>
   </select></label>
   <label className={field}>How many claims are affected?<input className={input} type="number" name="claimCount" min={1} max={100000} required value={count} onChange={e=>setCount(e.target.value)}/></label>
   <label className={field}>Are they with the same payer and experiencing the same issue?<select className={input} name="related" value={related} onChange={e=>setRelated(e.target.value)}><option value="yes">Yes</option><option value="no">No / not sure</option></select></label>
  </div>
  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
   <label className="flex items-start gap-2 text-sm font-medium"><input type="checkbox" checked={needsPackage} disabled={packageRequired} onChange={e=>setPackageKey(e.target.checked?'ten_denial':'')}/>Select a packaged Health Check instead of individual claim reviews</label>
   {packageRequired?<p className="mt-2 text-sm text-[var(--text-muted)]">More than 10 claims must use a packaged Health Check. Each package has its own included review scope.</p>:null}
   {needsPackage?<label className="mt-3 block text-sm font-semibold">Health Check package<select className={input} name="packageKey" value={packageKey} required onChange={e=>setPackageKey(e.target.value)}><option value="">Choose a package</option>{HEALTH_CHECKS.map(p=><option key={p.key} value={p.key}>{p.name} — ${p.fee}</option>)}</select></label>:<input type="hidden" name="packageKey" value=""/>}
  </div>
  <label className={field}>Describe the billing problem<textarea className={input} name="description" rows={4} minLength={8} maxLength={2000} required placeholder="Describe the problem without patient names, dates of birth, member IDs, or other PHI."/></label>
  <label className={field}>What has already been attempted?<textarea className={input} name="attempts" rows={3} maxLength={2000} placeholder="Describe prior payer responses or corrections attempted by the practice (no PHI)."/></label>
  <label className={field}>Is an appeal or correction deadline approaching?<select className={input} name="deadline" defaultValue="unsure"><option value="unsure">Unknown</option><option value="yes">Yes</option><option value="no">No</option></select></label>
  <div className="rounded-xl border border-[#d3e3da] bg-[#f0f8f3] p-4">
   <p className="text-xs font-bold uppercase tracking-wide text-[#315c43]">Preliminary project fee</p>
   <p className="mt-1 text-3xl font-bold text-[#154c34]">{quote?.fee!=null ? `$${quote.fee}` : 'Manual scope review'}</p>
   <p className="mt-2 text-sm text-[#355b46]">{quote?.serviceType==='health_check'?'Packaged assessment. The package scope determines which claims are examined.':quote?.fee!=null?'Document-based analysis and written recommendations. No corrections, claim submission, appeals, or payer calls included.':'Related-claim pricing does not cover this situation automatically.'}</p>
  </div>
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
   <strong>Required before payment:</strong> submitted claim, both sides of insurance card, denial/EOB/ERA, and claim history. This form does not accept patient documents. Do not include PHI in the narrative fields. Square payment and patient-document uploads remain disabled until the secure workflow is verified.
  </div>
  <button className="rounded-lg bg-[var(--brand)] px-5 py-3 font-semibold text-white hover:opacity-90" type="submit">Save request for documentation review</button>
 </form>;
}
