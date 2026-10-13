import test from 'node:test';
import assert from 'node:assert/strict';

const today = '2026-10-13';
const cases = [
  ['2026-10-12', 'overdue'],
  ['2026-10-13', 'critical'],
  ['2026-10-27', 'critical'],
  ['2026-10-28', 'warning'],
  ['2026-11-12', 'warning'],
  ['2026-11-13', 'upcoming'],
  ['2027-01-11', 'upcoming'],
  ['2027-01-12', 'normal'],
  [null, 'none'],
];

test('classifyDeadline pins exact date-only thresholds without timezone shifts', async () => {
  const { classifyDeadline } = await import('../../lib/dates/deadlines.ts');
  for (const [date, expected] of cases) assert.equal(classifyDeadline(date, today), expected, String(date));
});
