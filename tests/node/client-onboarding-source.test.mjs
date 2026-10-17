import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const drawer = fs.readFileSync(new URL('../../components/providers/provider-edit-drawer.tsx', import.meta.url), 'utf8');
const actions = fs.readFileSync(new URL('../../app/actions/providers.ts', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../../app/(workspace)/providers/page.tsx', import.meta.url), 'utf8');

test('new client uses one drawer with all onboarding sections', () => {
  for (const text of ['Add Client','Client / Provider Information','Practice / Location','License','CAQH','Malpractice','DEA / CSR','Employment / Background','Create Client']) {
    assert.match(drawer, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(drawer, /action=\{saveClientOnboardingForm\}/);
  assert.match(page, />Add client</);
});

test('single onboarding action distributes optional records to existing tables', () => {
  assert.match(actions, /saveClientOnboardingForm/);
  for (const table of ['locations','provider_locations','licenses','malpractice_insurance','dea_registrations','employment_history']) {
    assert.match(actions, new RegExp(`from\\('${table}'\\)`));
  }
});
