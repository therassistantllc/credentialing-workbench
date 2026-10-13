import 'server-only';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAppRole, type AppRole } from './roles';

export type RoleGuardResult =
  | { allowed: true; role: AppRole; userId: string; email: string | null }
  | { allowed: false; role: AppRole | null; userId: string; email: string | null };

export async function requireRole(allowed: readonly AppRole[]): Promise<RoleGuardResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect('/login');

  const rawRole = data.user.app_metadata?.role;
  const role = isAppRole(rawRole) ? rawRole : null;
  const base = { role, userId: data.user.id, email: data.user.email ?? null };
  return role && allowed.includes(role)
    ? { ...base, role, allowed: true }
    : { ...base, allowed: false };
}
