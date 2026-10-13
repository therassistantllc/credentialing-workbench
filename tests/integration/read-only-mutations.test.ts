import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('read-only mutation contract', () => {
  it('keeps read_only out of write policy predicates', async () => {
    const sql = await readFile('supabase/migrations/20261013071645_credentialing_rls_baseline.sql', 'utf8');
    const writePredicate = sql.match(/write_predicate text :=[\s\S]*?;/)?.[0] ?? '';
    expect(writePredicate).toContain('credentialing_specialist');
    expect(writePredicate).not.toContain('read_only');
  });
});
