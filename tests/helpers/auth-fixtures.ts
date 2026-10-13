export const TEST_ROLES = ['admin', 'credentialing_specialist', 'read_only'] as const;
export function testEmail(role: (typeof TEST_ROLES)[number]) { return `cw-${role}-${Date.now()}@example.test`; }
