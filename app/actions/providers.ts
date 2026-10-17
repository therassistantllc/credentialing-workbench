'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/require-role';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { providerUpdateSchema } from '@/lib/validation/providers';

function text(formData:FormData,key:string){return String(formData.get(key)??'').trim();}
function optionalText(formData:FormData,key:string){return text(formData,key)||undefined;}
function providerValues(formData:FormData){return {
  first_name:formData.get('first_name'),
  last_name:formData.get('last_name'),
  degree_suffix:optionalText(formData,'degree_suffix'),
  exact_credentials:optionalText(formData,'exact_credentials'),
  email:optionalText(formData,'email'),
  phone:optionalText(formData,'phone'),
  npi_number:optionalText(formData,'npi_number'),
  caqh_id:optionalText(formData,'caqh_id'),
  caqh_username:optionalText(formData,'caqh_username'),
  caqh_last_attestation_date:optionalText(formData,'caqh_last_attestation_date'),
  caqh_next_attestation_date:optionalText(formData,'caqh_next_attestation_date'),
  mfa_routing_note:optionalText(formData,'mfa_routing_note'),
  specialties:text(formData,'specialties').split(',').map(x=>x.trim()).filter(Boolean),
  notes:optionalText(formData,'notes')
};}

export async function updateProvider(formData:FormData){
  const guard=await requireRole(['admin','credentialing_specialist']);
  if(!guard.allowed)return {ok:false,error:'Read-only access cannot edit providers.'};
  const parsed=providerUpdateSchema.safeParse({id:formData.get('id'),...providerValues(formData)});
  if(!parsed.success)return {ok:false,error:'Check the provider fields and try again.'};
  const {id,...values}=parsed.data;
  const supabase=await createServerSupabaseClient();
  const {error}=await supabase.from('providers').update(values).eq('id',id);
  if(error)return {ok:false,error:error.message};
  revalidatePath('/providers');
  revalidatePath(`/providers/${id}`);
  return {ok:true,id};
}

export async function createProvider(formData:FormData){
  const guard=await requireRole(['admin','credentialing_specialist']);
  if(!guard.allowed)return {ok:false,error:'Read-only access cannot add providers.'};
  const parsed=providerUpdateSchema.omit({id:true}).safeParse(providerValues(formData));
  if(!parsed.success)return {ok:false,error:'Check the provider fields and try again.'};
  const supabase=await createServerSupabaseClient();
  const {data,error}=await supabase.from('providers').insert(parsed.data).select('id').single();
  if(error||!data)return {ok:false,error:error?.message??'Unable to create provider'};
  revalidatePath('/providers');
  return {ok:true,id:data.id};
}

type OnboardingResult={ok:true;id:string}|{ok:false;error:string};
export async function createClientOnboarding(formData:FormData):Promise<OnboardingResult>{
  const guard=await requireRole(['admin','credentialing_specialist']);
  if(!guard.allowed)return {ok:false,error:'Read-only access cannot add clients.'};

  const provider=providerUpdateSchema.omit({id:true}).safeParse(providerValues(formData));
  if(!provider.success)return {ok:false,error:'Check the client/provider fields and try again.'};

  const license={
    license_type:text(formData,'license_type'),
    license_number:text(formData,'license_number'),
    state:text(formData,'license_state').toUpperCase(),
    expiration_date:text(formData,'license_expiration_date'),
    status:text(formData,'license_status')||'Active'
  };
  const hasLicense=[license.license_type,license.license_number,license.state,license.expiration_date].some(Boolean);
  if(hasLicense&&(!license.license_type||!license.license_number||license.state.length!==2||!license.expiration_date))return {ok:false,error:'Complete the license type, number, 2-letter state, and expiration date.'};

  const malpractice={
    carrier:text(formData,'malpractice_carrier'),
    policy_number:text(formData,'malpractice_policy_number'),
    effective_date:text(formData,'malpractice_effective_date'),
    expiration_date:text(formData,'malpractice_expiration_date')
  };
  const hasMalpractice=Object.values(malpractice).some(Boolean);
  if(hasMalpractice&&Object.values(malpractice).some(v=>!v))return {ok:false,error:'Complete all malpractice insurance fields or leave that section blank.'};

  const employment={
    employer_name:optionalText(formData,'employer_name'),
    position_title:optionalText(formData,'position_title'),
    start_date:text(formData,'employment_start_date'),
    end_date:optionalText(formData,'employment_end_date'),
    is_work_gap:formData.get('is_work_gap')==='on',
    gap_explanation:optionalText(formData,'gap_explanation')
  };
  const hasEmployment=Boolean(employment.employer_name||employment.position_title||employment.start_date||employment.end_date||employment.is_work_gap||employment.gap_explanation);
  if(hasEmployment&&!employment.start_date)return {ok:false,error:'Employment/background entries require a start date.'};

  const location={
    name:text(formData,'location_name')||'Primary Practice',
    address_line1:optionalText(formData,'address_line1'),
    address_line2:optionalText(formData,'address_line2'),
    city:optionalText(formData,'city'),
    state:optionalText(formData,'location_state')?.toUpperCase(),
    zip_code:optionalText(formData,'zip_code'),
    phone:optionalText(formData,'location_phone'),
    fax:optionalText(formData,'fax')
  };
  const hasLocation=Boolean(text(formData,'location_name')||location.address_line1||location.address_line2||location.city||location.state||location.zip_code||location.phone||location.fax);

  const dea={
    dea_number:optionalText(formData,'dea_number'),
    dea_expiration_date:optionalText(formData,'dea_expiration_date'),
    state_csr_number:optionalText(formData,'state_csr_number'),
    state_csr_expiration_date:optionalText(formData,'state_csr_expiration_date')
  };
  const hasDea=Object.values(dea).some(Boolean);

  const supabase=await createServerSupabaseClient();
  const {data:created,error:createError}=await supabase.from('providers').insert(provider.data).select('id').single();
  if(createError||!created)return {ok:false,error:createError?.message??'Unable to create client'};
  const providerId=created.id;
  let createdLocationId:string|undefined;

  async function cleanup(){
    await supabase.from('malpractice_insurance').delete().eq('provider_id',providerId);
    await supabase.from('providers').delete().eq('id',providerId);
    if(createdLocationId)await supabase.from('locations').delete().eq('id',createdLocationId);
  }
  async function fail(message:string):Promise<OnboardingResult>{await cleanup();return {ok:false,error:message};}

  if(hasLocation){
    const {data:createdLocation,error}=await supabase.from('locations').insert(location).select('id').single();
    if(error||!createdLocation)return fail(error?.message??'Unable to create practice location');
    createdLocationId=createdLocation.id;
    const {error:linkError}=await supabase.from('provider_locations').insert({provider_id:providerId,location_id:createdLocation.id});
    if(linkError)return fail(linkError.message);
  }
  if(hasLicense){
    const {error}=await supabase.from('licenses').insert({provider_id:providerId,...license});
    if(error)return fail(error.message);
  }
  if(hasMalpractice){
    const {error}=await supabase.from('malpractice_insurance').insert({provider_id:providerId,...malpractice});
    if(error)return fail(error.message);
  }
  if(hasDea){
    const {error}=await supabase.from('dea_registrations').insert({provider_id:providerId,...dea});
    if(error)return fail(error.message);
  }
  if(hasEmployment){
    const {error}=await supabase.from('employment_history').insert({provider_id:providerId,...employment});
    if(error)return fail(error.message);
  }

  revalidatePath('/providers');
  revalidatePath(`/providers/${providerId}`);
  return {ok:true,id:providerId};
}

export async function saveClientOnboardingForm(formData:FormData){
  const result=await createClientOnboarding(formData);
  if(!result.ok)redirect(`/providers?new=1&error=${encodeURIComponent(result.error)}`);
  redirect(`/providers/${result.id}`);
}

export async function saveProviderForm(formData:FormData){
  const id=String(formData.get('id')??'');
  const result=id?await updateProvider(formData):await createProvider(formData);
  if(!result.ok)redirect(`/providers${id?`/${id}`:''}?error=${encodeURIComponent(result.error??'Unable to save provider')}`);
  redirect(`/providers/${result.id}`);
}
