import { getDashboardSummary } from '@/lib/queries/dashboard';
import { KpiStrip } from '@/components/dashboard/kpi-strip';
import { PriorityQueue } from '@/components/dashboard/priority-queue';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
export default async function DashboardPage(){const summary=await getDashboardSummary();return <div className="space-y-5"><div><h1 className="text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Credentialing work that needs attention today.</p></div><KpiStrip kpis={summary.kpis}/><div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"><section><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Priority work queue</h2><span className="text-xs text-[var(--text-muted)]">Sorted by urgency</span></div><PriorityQueue items={summary.priority}/></section><UpcomingDeadlines items={summary.upcoming}/></div></div>}
