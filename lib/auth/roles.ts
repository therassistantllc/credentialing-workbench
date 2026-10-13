export const APP_ROLES = ['admin', 'credentialing_specialist', 'read_only'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && APP_ROLES.includes(value as AppRole);
}

export function canWrite(role: AppRole | null | undefined) {
  return role === 'admin' || role === 'credentialing_specialist';
}
