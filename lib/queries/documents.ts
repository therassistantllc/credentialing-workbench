import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DocumentListItem } from '@/lib/types/workbench';
export async function getDocuments():Promise<DocumentListItem[]>{const supabase=await createServerSupabaseClient();const {data,error}=await supabase.from('documents').select('id,provider_id,document_type,storage_path,uploaded_at,providers(first_name,last_name)').order('uploaded_at',{ascending:false});if(error)throw error;return(data??[]).map((d:any)=>({id:d.id,providerId:d.provider_id,providerName:`${d.providers?.first_name??''} ${d.providers?.last_name??''}`.trim(),documentType:d.document_type,uploadedAt:d.uploaded_at,storagePath:d.storage_path}));}
