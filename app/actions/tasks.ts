'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/require-role';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const taskSchema = z.object({
  providerId: z.string().uuid(),
  payerApplicationId: z.string().uuid().or(z.literal('')).optional(),
  description: z.string().trim().min(1).max(1000),
  dueDate: z.string().date().or(z.literal('')).optional(),
});

export async function createTask(formData: FormData) {
  const guard = await requireRole(['admin', 'credentialing_specialist']);
  if (!guard.allowed) return;
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/tasks?error=invalid');
  const supabase = await createServerSupabaseClient();
  const applicationId = parsed.data.payerApplicationId || null;
  if (applicationId) {
    const { data } = await supabase.from('payer_applications').select('id,provider_id').eq('id', applicationId).maybeSingle();
    if (!data || data.provider_id !== parsed.data.providerId) redirect('/tasks?error=application-provider-mismatch');
  }
  const { error } = await supabase.from('tasks').insert({
    provider_id: parsed.data.providerId,
    payer_application_id: applicationId,
    description: parsed.data.description,
    due_date: parsed.data.dueDate || null,
    is_completed: false,
  });
  if (error) redirect('/tasks?error=create');
  revalidatePath('/tasks');
  redirect('/tasks');
}

export async function setTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const guard = await requireRole(['admin', 'credentialing_specialist']);
  if (!guard.allowed) return;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('tasks').update({ is_completed: completed }).eq('id', taskId);
  if (error) redirect('/tasks?error=update');
  revalidatePath('/tasks');
}
