import Link from 'next/link';

const nav = [
  ['Dashboard','/dashboard'],['Providers','/providers'],['Applications','/applications'],['Tasks','/tasks'],['Payers','/payers'],['Documents','/documents'],['Settings','/settings'],
] as const;

export function Sidebar(){return <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] md:block"><div className="border-b border-[var(--border)] px-5 py-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Therassistant</p><p className="mt-1 font-semibold">Credentialing Workbench</p></div><nav aria-label="Primary" className="p-3">{nav.map(([label,href])=><Link key={href} href={href} className="mb-1 block rounded-md px-3 py-2 text-sm font-medium hover:bg-[var(--surface-muted)]">{label}</Link>)}</nav></aside>}
