import { describe, expect, it } from 'vitest';
import { classifyDeadline } from '@/lib/dates/deadlines';
describe('deadline thresholds',()=>{it.each([[-1,'overdue'],[0,'critical'],[14,'critical'],[15,'warning'],[30,'warning'],[31,'upcoming'],[90,'upcoming'],[91,'normal']])('%i days => %s',(days,expected)=>{const base=Date.UTC(2026,9,13);const d=new Date(base+(days as number)*86400000).toISOString().slice(0,10);expect(classifyDeadline(d,'2026-10-13')).toBe(expected);});it('null => none',()=>expect(classifyDeadline(null,'2026-10-13')).toBe('none'));});
