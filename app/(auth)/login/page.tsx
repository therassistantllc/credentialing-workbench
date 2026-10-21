import { login } from '@/app/actions/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <section className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--brand)]">THERASSISTANT Consulting</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Sign in to the revenue cycle consulting workspace.</p>
        <form action={login.bind(null, {}) as never} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="rounded-md border border-[var(--border)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Password<input name="password" type="password" required autoComplete="current-password" className="rounded-md border border-[var(--border)] px-3 py-2" /></label>
          <button type="submit" className="rounded-md bg-[var(--brand)] px-4 py-2 font-semibold text-white">Sign in</button>
        </form>
      </section>
    </div>
  );
}
