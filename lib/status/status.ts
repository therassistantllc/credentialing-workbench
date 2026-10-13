export type StatusTone = 'neutral' | 'informational' | 'warning' | 'critical' | 'success';

const critical = new Set(['overdue', 'expired', 'missing', 'denied', 'rejected']);
const warning = new Set(['waiting', 'pending', 'expiring soon', 'recredentialing due', 'additional information requested']);
const success = new Set(['active', 'approved', 'effective', 'complete', 'clear', 'accepted', 'confirmed']);
const informational = new Set(['in progress', 'submitted', 'payer review', 'ready to submit', 'intake']);

export function normalizeStatus(value: string | null | undefined) {
  return (value ?? 'Not Started').trim().replaceAll('_', ' ').replace(/\s+/g, ' ');
}

export function statusTone(value: string | null | undefined): StatusTone {
  const normalized = normalizeStatus(value).toLowerCase();
  if (critical.has(normalized)) return 'critical';
  if (warning.has(normalized)) return 'warning';
  if (success.has(normalized)) return 'success';
  if (informational.has(normalized)) return 'informational';
  return 'neutral';
}
