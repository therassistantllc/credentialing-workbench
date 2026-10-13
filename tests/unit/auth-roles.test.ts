import { describe, expect, it } from 'vitest';
import { canWrite, isAppRole } from '@/lib/auth/roles';

describe('application roles', () => {
  it.each(['admin', 'credentialing_specialist', 'read_only'])('accepts %s', (role) => expect(isAppRole(role)).toBe(true));
  it.each([null, undefined, '', 'owner', 'user'])('rejects unknown role %s', (role) => expect(isAppRole(role)).toBe(false));
  it('allows writes only for admin and credentialing specialists', () => {
    expect(canWrite('admin')).toBe(true);
    expect(canWrite('credentialing_specialist')).toBe(true);
    expect(canWrite('read_only')).toBe(false);
  });
});
