import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=(p)=>readFile(new URL(`../../${p}`,import.meta.url),'utf8');

test('provider queue exposes all operational filters and provider edit wiring',async()=>{
  const [page,drawer,header,query]=await Promise.all([read('app/(workspace)/providers/page.tsx'),read('components/providers/provider-edit-drawer.tsx'),read('components/providers/provider-header.tsx'),read('lib/queries/providers.ts')]);
  for(const label of ['Credential type','Specialty','Application status','Payer','Missing credentials','Expiration','Recredentialing']) assert.match(page,new RegExp(label));
  assert.match(header,/Edit Provider/);
  assert.match(drawer,/updateProvider/);
  assert.match(query,/payer_applications/);
  assert.match(query,/licenses/);
  assert.match(query,/tasks/);
});

test('provider credential/location/application/contract/task actions are wired to visible forms',async()=>{
  const [providerPage,credDrawer,locDrawer,appForm,contractPanel,header]=await Promise.all([
    read('app/(workspace)/providers/[providerId]/page.tsx'),read('components/credentials/credential-drawer.tsx'),read('components/providers/location-drawer.tsx'),read('components/applications/application-form.tsx'),read('components/applications/contract-panel.tsx'),read('components/providers/provider-header.tsx')
  ]);
  assert.match(providerPage,/CredentialDrawer/);
  assert.match(providerPage,/LocationDrawer/);
  assert.match(providerPage,/TaskTable/);
  assert.match(credDrawer,/addLicense/);
  assert.match(credDrawer,/configureCaqhSecret/);
  assert.match(locDrawer,/createAndLinkLocation/);
  assert.match(appForm,/saveApplicationForm/);
  assert.match(contractPanel,/createContractForm/);
  assert.match(header,/\/tasks\?new=1&provider=/);
});

test('dashboard priority includes credential and CAQH deadlines, not only tasks',async()=>{
  const source=await read('lib/queries/dashboard.ts');
  assert.match(source,/Credential/);
  assert.match(source,/CAQH/);
  assert.match(source,/credentialDeadlines/);
});

test('payer add and edit controls are wired to a mutation drawer',async()=>{
  const [list,detail,drawer,actions]=await Promise.all([read('app/(workspace)/payers/page.tsx'),read('components/payers/payer-detail.tsx'),read('components/payers/payer-edit-drawer.tsx'),read('app/actions/payers.ts')]);
  assert.match(list,/PayerEditDrawer/);
  assert.match(detail,/Edit Payer/);
  assert.match(drawer,/savePayerForm/);
  assert.match(actions,/updatePayer/);
});
