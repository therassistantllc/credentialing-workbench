import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { classifyDeadline, todayDateOnly } from '@/lib/dates/deadlines';
import type { CredentialDeadline, ProviderListItem, ProviderWorkspace } from '@/lib/types/workbench';

const providerColumns = 'id,first_name,last_name,degree_suffix,exact_credentials,email,phone,npi_number,caqh_id,caqh_last_attestation_date,caqh_next_attestation_date,medicare_opt_out,medicare_opt_out_effective_date,medicare_opt_out_renewal_date,specialties,notes,created_at,updated_at';

function providerListItem(row: any, today: string): ProviderListItem {
  const applications = row.payer_applications ?? [];
  const licenses = row.licenses ?? [];
  const malpractice = row.malpractice_insurance ?? [];
  const dea = row.dea_registrations ?? [];
  const tasks = row.tasks ?? [];
  const agreements = row.service_agreements ?? [];
  const employment = row.employment_history ?? [];
  const sanctions = row.sanction_checks ?? [];
  const documents = row.documents ?? [];

  const credentialDeadlines: CredentialDeadline[] = [
    ...licenses.filter((x:any)=>x.expiration_date).map((x:any)=>({type:`${x.license_type || 'License'} expiration`,date:x.expiration_date,state:classifyDeadline(x.expiration_date,today)})),
    ...malpractice.filter((x:any)=>x.expiration_date).map((x:any)=>({type:'Malpractice expiration',date:x.expiration_date,state:classifyDeadline(x.expiration_date,today)})),
    ...dea.filter((x:any)=>x.dea_expiration_date).map((x:any)=>({type:'DEA expiration',date:x.dea_expiration_date,state:classifyDeadline(x.dea_expiration_date,today)})),
    ...dea.filter((x:any)=>x.state_csr_expiration_date).map((x:any)=>({type:'State CSR expiration',date:x.state_csr_expiration_date,state:classifyDeadline(x.state_csr_expiration_date,today)})),
  ].sort((a,b)=>a.date.localeCompare(b.date));

  const recredDates = applications.map((x:any)=>x.recred_due_date).filter(Boolean) as string[];
  const allDeadlines = [...credentialDeadlines.map(x=>x.date), row.caqh_next_attestation_date, ...recredDates].filter(Boolean).sort() as string[];
  const missingCredentials: string[] = [];
  if (!licenses.length) missingCredentials.push('License');
  if (!malpractice.length) missingCredentials.push('Malpractice');
  if (!dea.length) missingCredentials.push('DEA / CSR');
  if (!row.caqh_id) missingCredentials.push('CAQH');

  const readinessChecks = [row.npi_number,row.caqh_id,licenses.length>0,malpractice.length>0,employment.length>0,sanctions.length>0,agreements.length>0,documents.length>0];
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    credentials: row.exact_credentials ?? row.degree_suffix,
    npi: row.npi_number,
    caqhId: row.caqh_id,
    specialties: row.specialties ?? [],
    status: 'Active',
    applicationCount: applications.length,
    applicationStatuses: applications.map((x:any)=>x.status ?? 'Not Started'),
    payerNames: applications.map((x:any)=>x.payers?.name).filter(Boolean),
    credentialTypes: [licenses.length?'License':null,malpractice.length?'Malpractice':null,dea.length?'DEA / CSR':null,row.caqh_id?'CAQH':null].filter(Boolean) as string[],
    missingCredentials,
    recredentialingDue: recredDates.some(date=>['overdue','critical','warning'].includes(classifyDeadline(date,today))),
    readinessPercent: Math.round((readinessChecks.filter(Boolean).length/readinessChecks.length)*100),
    nextDeadline: allDeadlines[0] ?? null,
    nextDeadlineState: classifyDeadline(allDeadlines[0] ?? null,today),
    caqhNextAttestationDate: row.caqh_next_attestation_date,
    credentialDeadlines,
    openTaskCount: tasks.filter((x:any)=>!x.is_completed).length,
  };
}

export async function getProviders(): Promise<ProviderListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('providers').select(`${providerColumns},payer_applications(id,status,recred_due_date,payers(name)),licenses(id,license_type,expiration_date),malpractice_insurance(id,expiration_date),dea_registrations(id,dea_expiration_date,state_csr_expiration_date),tasks(id,is_completed),service_agreements(id,agreement_status),employment_history(id),sanction_checks(id),documents(id)`).order('last_name');
  if (error) throw error;
  const today=todayDateOnly();
  return (data ?? []).map((row:any)=>providerListItem(row,today));
}

export async function getProviderWorkspace(providerId: string): Promise<ProviderWorkspace | null> {
  const supabase = await createServerSupabaseClient();
  const providerResult = await supabase.from('providers').select(providerColumns).eq('id', providerId).maybeSingle();
  if (providerResult.error) throw providerResult.error;
  if (!providerResult.data) return null;
  const [applications, licenses, malpractice, dea, sanctions, employment, documents, tasks, proposals, agreements, contracts, providerLocations, secretState] = await Promise.all([
    supabase.from('payer_applications').select('id,provider_id,payer_id,service_agreement_id,status,enrollment_type,submission_date,effective_date,recred_due_date,eft_enrollment_status,era_enrollment_status,clearinghouse_provider_id,notes,payers(id,name)').eq('provider_id', providerId),
    supabase.from('licenses').select('id,provider_id,license_type,license_number,state,expiration_date,status').eq('provider_id', providerId),
    supabase.from('malpractice_insurance').select('id,provider_id,carrier,policy_number,effective_date,expiration_date').eq('provider_id', providerId),
    supabase.from('dea_registrations').select('id,provider_id,dea_number,dea_expiration_date,state_csr_number,state_csr_expiration_date').eq('provider_id', providerId),
    supabase.from('sanction_checks').select('id,provider_id,check_type,checked_at,status,report_reference_number').eq('provider_id', providerId),
    supabase.from('employment_history').select('id,provider_id,employer_name,position_title,start_date,end_date,is_work_gap,gap_explanation').eq('provider_id', providerId),
    supabase.from('documents').select('id,provider_id,document_type,storage_path,uploaded_at').eq('provider_id', providerId),
    supabase.from('tasks').select('id,provider_id,payer_application_id,description,due_date,is_completed').eq('provider_id', providerId),
    supabase.from('proposals').select('id,provider_id,status,proposed_fee,scope_of_work,sent_date,expiration_date').eq('provider_id', providerId),
    supabase.from('service_agreements').select('id,provider_id,proposal_id,agreement_status,pricing_model,fee_amount,scope_of_work,signed_date,effective_date,expiration_date').eq('provider_id', providerId),
    supabase.from('contracts').select('id,provider_id,payer_application_id,contract_name,contract_status,signed_date,effective_date,termination_date,fee_schedule_details,payer_applications(payers(name))').eq('provider_id', providerId),
    supabase.from('provider_locations').select('provider_id,location_id,locations(id,name,address_line1,address_line2,city,state,zip_code,phone,fax)').eq('provider_id', providerId),
    supabase.rpc('has_caqh_secret',{p_provider_id:providerId}),
  ]);
  const p: any = providerResult.data;
  const today = todayDateOnly();
  const appItems = (applications.data ?? []).map((a: any) => ({ id:a.id,providerId:a.provider_id,providerName:`${p.first_name} ${p.last_name}`,payerId:a.payer_id,payerName:a.payers?.name ?? 'Unknown payer',status:a.status ?? 'Not Started',enrollmentType:a.enrollment_type,submissionDate:a.submission_date,effectiveDate:a.effective_date,recredDueDate:a.recred_due_date,eftStatus:a.eft_enrollment_status ?? 'Not Started',eraStatus:a.era_enrollment_status ?? 'Not Started',serviceAgreementId:a.service_agreement_id,openTaskCount:(tasks.data ?? []).filter((t:any)=>t.payer_application_id===a.id&&!t.is_completed).length }));
  const docItems = (documents.data ?? []).map((d:any)=>({id:d.id,providerId:d.provider_id,providerName:`${p.first_name} ${p.last_name}`,documentType:d.document_type,uploadedAt:d.uploaded_at,storagePath:d.storage_path}));
  const taskItems = (tasks.data ?? []).map((t:any)=>({id:t.id,providerId:t.provider_id,providerName:`${p.first_name} ${p.last_name}`,payerApplicationId:t.payer_application_id,payerName:null,description:t.description,dueDate:t.due_date,deadline:classifyDeadline(t.due_date,today),completed:Boolean(t.is_completed)}));
  const synthetic = providerListItem({...p,payer_applications:applications.data??[],licenses:licenses.data??[],malpractice_insurance:malpractice.data??[],dea_registrations:dea.data??[],tasks:tasks.data??[],service_agreements:agreements.data??[],employment_history:employment.data??[],sanction_checks:sanctions.data??[],documents:documents.data??[]},today);
  return { provider:{...synthetic,firstName:p.first_name,lastName:p.last_name,degreeSuffix:p.degree_suffix,exactCredentials:p.exact_credentials,email:p.email,phone:p.phone,caqhLastAttestationDate:p.caqh_last_attestation_date,caqhNextAttestationDate:p.caqh_next_attestation_date,medicareOptOut:Boolean(p.medicare_opt_out),medicareOptOutRenewalDate:p.medicare_opt_out_renewal_date,notes:p.notes,caqhSecretConfigured:secretState.error?null:Boolean(secretState.data)},applications:appItems,licenses:licenses.data??[],malpractice:malpractice.data??[],dea:dea.data??[],sanctions:sanctions.data??[],employment:employment.data??[],documents:docItems,tasks:taskItems,proposals:proposals.data??[],serviceAgreements:agreements.data??[],contracts:contracts.data??[],locations:(providerLocations.data??[]).map((x:any)=>x.locations).filter(Boolean)};
}
