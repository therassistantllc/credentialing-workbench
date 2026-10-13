import { createAdminSupabaseClient } from '@/lib/supabase/admin';

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required');
  const supabase = createAdminSupabaseClient();
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true, app_metadata: { ...existing.app_metadata, role: 'admin' } });
    if (error) throw error;
  } else {
    const { error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'admin' } });
    if (error) throw error;
  }
  console.log('Bootstrap admin configured.');
}
