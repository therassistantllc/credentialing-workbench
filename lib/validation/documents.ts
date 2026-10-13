import { z } from 'zod';
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const documentUploadSchema = z.object({
  providerId: z.string().uuid(),
  documentType: z.string().trim().min(1).max(100),
  file: z.instanceof(File)
    .refine(file => DOCUMENT_MIME_TYPES.includes(file.type as (typeof DOCUMENT_MIME_TYPES)[number]), 'File must be PDF, JPEG, or PNG.')
    .refine(file => file.size > 0 && file.size <= MAX_DOCUMENT_BYTES, 'File must be between 1 byte and 10 MB.'),
});
