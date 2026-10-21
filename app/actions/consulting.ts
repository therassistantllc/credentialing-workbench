'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/require-role';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateConsultingQuote } from '@/lib/consulting/pricing';

const schema = z.object({
  practice: z.string().trim().min(2).max(150),
  email: z.union([z.literal(''), z.email()]).default(''),
  contractorCode: z.string().trim().max(80).default(''),
  issueType: z.enum(['denial','rejection','network','payment','credentialing','other']),
  claimCount: z.coerce.number().int().min(1).max(100000),
  related: z.enum(['yes','no']),
  packageKey: z.string().max(50).default(''),
  description: z.string().trim().min(8).max(2000),
  attempts: z.string().trim().max(2000).default(''),
  deadline: z.enum(['yes','no','unsure'])
});

export async function createConsultingRequest(formData: FormData): Promise<void> {
  const guard=await requireRole(['admin','credentialing_specialist']);
  if (!guard.allowed) redirect('/requests?error=permission');
  const raw=Object.fromEntries(formData.entries());
  const parsed=schema.safeParse(raw);
  if (!parsed.success) redirect('/requests/new?error=invalid');
  const v=parsed.data;
  const quote=calculateConsultingQuote({
    claimCount:v.claimCount, related:v.related==='yes',issueType:v.issueType,
    packageKey:v.packageKey
  });
  if (!quote || quote.tier==='package_selection_required') redirect('/requests/new?error=package');
  const supabase=await createServerSupabaseClient();
  const {data:practice,error:practiceError}=await supabase.from('consulting_practices').insert({
    practice_name:v.practice,contact_email:v.email||null,contractor_tracking_code:v.contractorCode||null
  }).select('id').single();
  if (practiceError || !practice) redirect('/requests/new?error=save');
  const {error}=await supabase.from('consulting_projects').insert({
    practice_id:practice.id,service_type:quote.serviceType,
    issue_type:v.issueType,claim_count:v.claimCount,same_payer_issue:v.related==='yes',
    problem_description:v.description,previous_attempts:v.attempts,
    deadline_status:v.deadline,pricing_tier:quote.tier,quoted_fee:quote.fee,
    package_key:quote.packageKey,
    status:quote.fee===null?'scope_review':'documentation_pending',
    created_by:guard.userId
  });
  if (error) redirect('/requests/new?error=save');
  redirect('/requests?created=1');
}
