export type DeadlineState = 'overdue' | 'critical' | 'warning' | 'upcoming' | 'normal' | 'none';

function utcDay(dateOnly: string) {
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Invalid date-only value: ${dateOnly}`);
  return Date.UTC(year, month - 1, day);
}

export function daysBetweenDateOnly(date: string, today: string) {
  return Math.round((utcDay(date) - utcDay(today)) / 86_400_000);
}

export function classifyDeadline(date: string | null | undefined, today: string): DeadlineState {
  if (!date) return 'none';
  const days = daysBetweenDateOnly(date, today);
  if (days < 0) return 'overdue';
  if (days <= 14) return 'critical';
  if (days <= 30) return 'warning';
  if (days <= 90) return 'upcoming';
  return 'normal';
}

export function todayDateOnly(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
