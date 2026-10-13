import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
export const DOCUMENT_BUCKET = 'credentialing-documents';
export async function createSignedDocumentUrl(path:string, expiresInSeconds=300){const s=await createServerSupabaseClient();const {data,error}=await s.storage.from(DOCUMENT_BUCKET).createSignedUrl(path,expiresInSeconds);if(error)return null;return data.signedUrl;}
export async function uploadCredentialingDocument(path:string,file:File){const s=await createServerSupabaseClient();return s.storage.from(DOCUMENT_BUCKET).upload(path,file,{contentType:file.type,upsert:false});}
export async function removeCredentialingDocument(path:string){const s=await createServerSupabaseClient();return s.storage.from(DOCUMENT_BUCKET).remove([path]);}
