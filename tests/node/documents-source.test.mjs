import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=(p)=>readFile(new URL(`../../${p}`,import.meta.url),'utf8');

test('document UI requires provider/type/file and renders signed access rather than raw storage paths', async()=>{
  const [page,table,drawer,actions,storage,validation]=await Promise.all([
    read('app/(workspace)/documents/page.tsx'),read('components/documents/document-table.tsx'),read('components/documents/upload-drawer.tsx'),read('app/actions/documents.ts'),read('lib/supabase/storage.ts'),read('lib/validation/documents.ts')
  ]);
  for(const label of ['Document Type','Provider','Uploaded At','View / Download']) assert.match(table,new RegExp(label));
  for(const label of ['Provider','Document Type','File']) assert.match(drawer,new RegExp(label));
  assert.match(validation,/application\/pdf/);
  assert.match(validation,/image\/jpeg/);
  assert.match(actions,/provider\//);
  assert.match(actions,/randomUUID/);
  assert.match(actions,/remove/);
  assert.match(storage,/createSignedUrl/);
  assert.doesNotMatch(table,/storagePath/);
  assert.match(page,/No documents|DocumentTable/);
});

test('storage migration is private, role scoped, and provider path validated', async()=>{
  const migration=await read('supabase/migrations/20261013072802_credentialing_documents_storage.sql');
  assert.match(migration,/credentialing-documents/);
  assert.match(migration,/public\s*=\s*false/i);
  assert.match(migration,/credentialing_specialist/);
  assert.match(migration,/read_only/);
  assert.match(migration,/storage\.foldername/);
  assert.match(migration,/providers/);
});
