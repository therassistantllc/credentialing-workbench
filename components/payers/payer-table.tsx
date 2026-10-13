import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import type { PayerListItem } from '@/lib/types/workbench';
export function PayerTable({ payers }: { payers: PayerListItem[] }) {
  if (!payers.length) return <EmptyState title="No payers" description="Add payer reference information to begin credentialing." actionLabel="Add payer" href="/payers?new=1"/>;
  return <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]"><table className="min-w-full text-sm"><thead className="bg-[var(--surface-muted)] text-left text-xs uppercase text-[var(--text-muted)]"><tr>{['Name','Electronic Payer ID','Credentialing Portal','Phone','Fax','Submission Email','Active Applications'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody>{payers.map(p => <tr key={p.id} className="h-12 border-t border-[var(--border)]"><td className="px-3"><Link href={`/payers/${p.id}`} className="font-semibold text-[var(--brand)]">{p.name}</Link></td><td className="px-3">{p.electronicPayerId ?? '—'}</td><td className="px-3">{p.portalUrl ? 'Available' : '—'}</td><td className="px-3">{p.phone ?? '—'}</td><td className="px-3">{p.fax ?? '—'}</td><td className="px-3">{p.submissionEmail ?? '—'}</td><td className="px-3">{p.activeApplications}</td></tr>)}</tbody></table></div>;
}
