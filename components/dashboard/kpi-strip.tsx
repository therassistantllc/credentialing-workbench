import Link from 'next/link';
import type { DashboardKpis } from '@/lib/types/workbench';
const cards=(k:DashboardKpis)=>[
  ['Active Providers',k.activeProviders,'/providers?status=active'],
  ['Applications In Progress',k.applicationsInProgress,'/applications?status=in-progress'],
  ['Waiting on Payer',k.waitingOnPayer,'/applications?status=waiting'],
  ['Recredentialing Due',k.recredentialingDue,'/applications?recred=due'],
  ['Credentials Expiring',k.credentialsExpiring,'/providers?expiration=30'],
  ['CAQH Attestations Due',k.caqhAttestationsDue,'/providers?caqh=due'],
  ['Open Tasks',k.openTasks,'/tasks?status=open'],
] as const;
export function KpiStrip({kpis}:{kpis:DashboardKpis}){return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">{cards(kpis).map(([label,value,href])=><Link key={label} href={href} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm hover:border-[var(--brand)]"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{label}</p></Link>)}</div>}
