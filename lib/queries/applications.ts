import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { classifyDeadline, todayDateOnly } from '@/lib/dates/deadlines';
import type { ApplicationListItem, ApplicationWorkspace } from '@/lib/types/workbench';

export async function getApplications(): Promise<ApplicationListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('payer_applications').select('id,provider_id,payer_id,service_agreement_id,status,enrollment_type,submission_date,effective_date,recred_due_date,eft_enrollment_status,era_enrollment_status,providers(first_name,last_name),payers(name),tasks(id,is_completed)').order('created_at', { ascending:false });
  if (error) throw error;
  return (data ?? []).map((a:any)=>({id:a.id,providerId:a.provider_id,providerName:`${a.providers?.first_name??''} ${a.providers?.last_name??''}`.trim(),payerId:a.payer_id,payerName:a.payers?.name??'Unknown payer',status:a.status??'Not Started',enrollmentType:a.enrollment_type,submissionDate:a.submission_date,effectiveDate:a.effective_date,recredDueDate:a.recred_due_date,eftStatus:a.eft_enrollment_status??'Not Started',eraStatus:a.era_enrollment_status??'Not Started',serviceAgreementId:a.service_agreement_id,openTaskCount:(a.tasks??[]).filter((t:any)=>!t.is_completed).length}));
}

export async function getApplicationWorkspace(applicationId:string): Promise<ApplicationWorkspace|null>{
  const supabase=await createServerSupabaseClient();
  const {data:a,error}=await supabase.from('payer_applications').select('id,provider_id,payer_id,service_agreement_id,status,enrollment_type,submission_date,effective_date,recred_due_date,eft_enrollment_status,era_enrollment_status,clearinghouse_provider_id,notes,providers(first_name,last_name),payers(name)').eq('id',applicationId).maybeSingle();
  if(error) throw error; if(!a) return null;
  const [tasks,contracts,agreement,documents]=await Promise.all([
    supabase.from('tasks').select('id,provider_id,payer_application_id,description,due_date,is_completed').eq('payer_application_id',applicationId),
    supabase.from('contracts').select('id,provider_id,payer_application_id,contract_name,contract_status,signed_date,effective_date,termination_date,fee_schedule_details,storage_path').eq('payer_application_id',applicationId),
    a.service_agreement_id?supabase.from('service_agreements').select('id,provider_id,proposal_id,agreement_status,pricing_model,fee_amount,scope_of_work,signed_date,effective_date,expiration_date').eq('id',a.service_agreement_id).maybeSingle():Promise.resolve({data:null,error:null}),
    supabase.from('documents').select('id,provider_id,document_type,storage_path,uploaded_at').eq('provider_id',a.provider_id),
  ]);
  const providerName=`${(a as any).providers?.first_name??''} ${(a as any).providers?.last_name??''}`.trim(); const today=todayDateOnly();
  const taskItems=(tasks.data??[]).map((t:any)=>({id:t.id,providerId:t.provider_id,providerName,payerApplicationId:t.payer_application_id,payerName:(a as any).payers?.name??null,description:t.description,dueDate:t.due_date,deadline:classifyDeadline(t.due_date,today),completed:Boolean(t.is_completed)}));
  const application={id:a.id,providerId:a.provider_id,providerName,payerId:a.payer_id,payerName:(a as any).payers?.name??'Unknown payer',status:a.status??'Not Started',enrollmentType:a.enrollment_type,submissionDate:a.submission_date,effectiveDate:a.effective_date,recredDueDate:a.recred_due_date,eftStatus:a.eft_enrollment_status??'Not Started',eraStatus:a.era_enrollment_status??'Not Started',serviceAgreementId:a.service_agreement_id,openTaskCount:taskItems.filter((t:any)=>!t.completed).length,notes:a.notes,clearinghouseProviderId:a.clearinghouse_provider_id};
  return {application,tasks:taskItems,contracts:contracts.data??[],serviceAgreement:agreement.data??null,documents:(documents.data??[]).map((d:any)=>({id:d.id,providerId:d.provider_id,providerName,documentType:d.document_type,uploadedAt:d.uploaded_at,storagePath:d.storage_path}))};
}
