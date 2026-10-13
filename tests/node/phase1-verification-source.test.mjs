import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=(p)=>readFile(new URL(`../../${p}`,import.meta.url),'utf8');
test('phase one verification checks source secrets and live database contract',async()=>{const [script,doc,pkg]=await Promise.all([read('scripts/phase1-verification.ts'),read('docs/phase1-verification.md'),read('package.json')]);for(const token of ['caqh_password','NEXT_PUBLIC_','phase1_security_contract','malpractice_provider_type','anon_grant_count','operational_policy_count'])assert.match(script,new RegExp(token));assert.match(doc,/mkmqkvahkafdthcmsass/);assert.match(doc,/credentialing-documents/);assert.match(doc,/GitHub/i);assert.match(pkg,/verify:phase1/);});
