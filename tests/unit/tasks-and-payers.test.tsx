import { describe, expect, it } from 'vitest';
import { classifyDeadline } from '@/lib/dates/deadlines';
describe('task queue date states',()=>{it('separates overdue from due today',()=>{expect(classifyDeadline('2026-10-12','2026-10-13')).toBe('overdue');expect(classifyDeadline('2026-10-13','2026-10-13')).toBe('critical');});});
