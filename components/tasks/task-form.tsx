import { createTask } from '@/app/actions/tasks';

export function TaskForm({ providerId = '', payerApplicationId = '' }: { providerId?: string; payerApplicationId?: string }) {
  return <form action={createTask} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-2">
    <h2 className="md:col-span-2 text-base font-semibold">Create task</h2>
    <label className="text-xs font-semibold">Provider ID<input name="providerId" defaultValue={providerId} required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" /></label>
    <label className="text-xs font-semibold">Payer application ID<input name="payerApplicationId" defaultValue={payerApplicationId} placeholder="Optional" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" /></label>
    <label className="md:col-span-2 text-xs font-semibold">Description<input name="description" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" /></label>
    <label className="text-xs font-semibold">Due date<input name="dueDate" type="date" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" /></label>
    <div className="flex items-end"><button className="rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white">Create task</button></div>
  </form>;
}
