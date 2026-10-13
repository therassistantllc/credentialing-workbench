import { describe,expect,it } from 'vitest';
import { DOCUMENT_MIME_TYPES,MAX_DOCUMENT_BYTES } from '@/lib/validation/documents';
describe('document upload constraints',()=>{it('limits document types and size',()=>{expect(DOCUMENT_MIME_TYPES).toEqual(['application/pdf','image/jpeg','image/png']);expect(MAX_DOCUMENT_BYTES).toBe(10*1024*1024);});});
