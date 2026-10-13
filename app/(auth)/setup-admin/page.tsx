import { redirect } from 'next/navigation';
import { createFirstAdmin } from '@/app/actions/bootstrap-admin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const messages: Record<string, string> = {
  email: 'Enter a valid email address.',
  password: 'Use a password with at least 12 characters.',
  mismatch: 'The passwords do not match.',
  unavailable: 'Administrator setup is temporarily unavailable.',
  create: 'The administrator account could not be created.',
};

export default async function SetupAdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) throw new Error('Unable to verify administrator setup state');
  if (data.users.length > 0) redirect('/login?setup=closed');

  const params = await searchParams;
  const message = params.error ? messages[params.error] : undefined;

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <section className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--brand)]">Credentialing Workbench</p>
        <h1 className="mt-2 text-2xl font-semibold">Create first administrator</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">This page disables itself as soon as the first account is created.</p>
        {message ? <p role="alert" className="mt-4 rounded-md border border-[var(--border)] p-3 text-sm">{message}</p> : null}
        <form action={createFirstAdmin} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" defaultValue="admin@therassistant.com" className="rounded-md border border-[var(--border)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Password<input name="password" type="password" required minLength={12} autoComplete="new-password" className="rounded-md border border-[var(--border)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Confirm password<input name="confirmPassword" type="password" required minLength={12} autoComplete="new-password" className="rounded-md border border-[var(--border)] px-3 py-2" /></label>
          <button type="submit" className="rounded-md bg-[var(--brand)] px-4 py-2 font-semibold text-white">Create administrator</button>
        </form>
      </section>
    </div>
  );
}
