import { DocumentTable } from '@/components/documents/document-table';
import { createSignedDocumentUrl } from '@/lib/supabase/storage';
import type { DocumentListItem } from '@/lib/types/workbench';
export async function ProviderDocuments({providerId,documents}:{providerId:string;documents:DocumentListItem[]}){const view=await Promise.all(documents.map(async d=>({id:d.id,providerId:d.providerId,providerName:d.providerName,documentType:d.documentType,uploadedAt:d.uploadedAt,signedUrl:await createSignedDocumentUrl(d.storagePath)})));return <DocumentTable documents={view} uploadHref={`/documents?upload=1&provider=${providerId}`}/>}
