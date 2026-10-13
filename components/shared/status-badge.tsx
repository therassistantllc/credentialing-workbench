import { statusTone } from '@/lib/status/status';
const toneClass={neutral:'bg-[var(--neutral-bg)] text-[var(--neutral-text)]',informational:'bg-[var(--info-bg)] text-[var(--info-text)]',warning:'bg-[var(--warning-bg)] text-[var(--warning-text)]',critical:'bg-[var(--critical-bg)] text-[var(--critical-text)]',success:'bg-[var(--success-bg)] text-[var(--success-text)]'};
export function StatusBadge({status}:{status:string}){const tone=statusTone(status);return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneClass[tone]}`}>{status}</span>}
