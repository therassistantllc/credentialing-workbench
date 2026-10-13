import { TaskForm } from '@/components/tasks/task-form';
import { TaskTable } from '@/components/tasks/task-table';
import { getTasks } from '@/lib/queries/tasks';
import { todayDateOnly } from '@/lib/dates/deadlines';

function addDays(date: string, days: number) { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const all = await getTasks();
  const today = todayDateOnly();
  const weekEnd = addDays(today, 7);
  const status = params.status ?? 'open';
  const tasks = all.filter(t => {
    if (status === 'open' && t.completed) return false;
    if (status === 'completed' && !t.completed) return false;
    if (status === 'overdue' && (t.completed || t.deadline !== 'overdue')) return false;
    if (status === 'today' && (t.completed || t.dueDate !== today)) return false;
    if (status === 'week' && (t.completed || !t.dueDate || t.dueDate < today || t.dueDate > weekEnd)) return false;
    if (params.provider && t.providerId !== params.provider) return false;
    if (params.payer && t.payerName !== params.payer) return false;
    return true;
  });
  const providers = [...new Map(all.map(t => [t.providerId, t.providerName])).entries()];
  const payers = [...new Set(all.map(t => t.payerName).filter(Boolean))] as string[];
  const filters = [['open','Open'],['completed','Completed'],['overdue','Overdue'],['today','Due Today'],['week','Due This Week']];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Tasks</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Operational follow-up across provider and payer credentialing work.</p></div><a href="/tasks?new=1" className="rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white">Create task</a></div>
    <form className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-3">
      <label className="text-xs font-semibold">Queue<select name="status" defaultValue={status} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">{filters.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-xs font-semibold">Provider<select name="provider" defaultValue={params.provider ?? ''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">All providers</option>{providers.map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label className="text-xs font-semibold">Payer<select name="payer" defaultValue={params.payer ?? ''} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"><option value="">All payers</option>{payers.map(name => <option key={name}>{name}</option>)}</select></label>
      <button className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold md:col-span-3 md:justify-self-end">Apply filters</button>
    </form>
    {params.new === '1' ? <TaskForm providerId={params.provider} payerApplicationId={params.application} /> : null}
    <TaskTable tasks={tasks}/>
  </div>;
}
