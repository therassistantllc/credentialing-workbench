import Link from 'next/link';
const nav=[['Dashboard','/dashboard'],['Consulting Requests','/requests'],['New Request','/requests/new'],['Health Checks','/health-checks'],['Practices','/practices'],['Reports','/reports'],['Contractors','/contractors']] as const;
export function Sidebar(){return <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] md:block">
 <div className="h-2 w-full" style={{background:'linear-gradient(90deg,#8b1f2e 0 14%,#186044 14% 28%,#583b7e 28% 42%,#edc729 42% 56%,#172f5e 56% 70%,#b85d23 70% 84%,#333 84% 100%)'}}/>
 <div className="border-b border-[var(--border)] px-5 py-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1d6446]">Therassistant</p><p className="mt-1 font-semibold">Revenue Cycle Consulting</p><p className="mt-1 text-xs text-[var(--text-muted)]">Investigate • Explain • Recommend</p></div>
 <nav aria-label="Primary" className="p-3">{nav.map(([label,href])=><Link key={href} href={href} className="mb-1 block rounded-md px-3 py-2 text-sm font-medium hover:bg-[#edf7ef] hover:text-[#144a34]">{label}</Link>)}</nav>
 <div className="mx-3 mt-3 border-t border-[var(--border)] px-3 pt-4 text-xs text-[var(--text-muted)]">No claim corrections, resubmissions, or payer follow-up included.</div>
 </aside>}