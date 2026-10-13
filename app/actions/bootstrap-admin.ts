'use server';

import { redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

function fail(code: string): never {
  redirect(`/setup-admin?error=${encodeURIComponent(code)}`);
}

export async function createFirstAdmin(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!email || !email.includes('@')) fail('email');
  if (password.length < 12) fail('password');
  if (password !== confirmPassword) fail('mismatch');

  const admin = createAdminSupabaseClient();
  const { data: existing, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (listError) fail('unavailable');
  if (existing.users.length > 0) redirect('/login?setup=closed');

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  });
  if (error) fail('create');

  redirect('/login?setup=complete');
}
