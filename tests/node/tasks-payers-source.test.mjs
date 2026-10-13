import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('tasks workspace exposes required filters and contextual creation', async () => {
  const [page, table, form, actions] = await Promise.all([
    read('app/(workspace)/tasks/page.tsx'),
    read('components/tasks/task-table.tsx'),
    read('components/tasks/task-form.tsx'),
    read('app/actions/tasks.ts'),
  ]);
  for (const label of ['Open', 'Completed', 'Overdue', 'Due Today', 'Due This Week']) {
    assert.match(page + table, new RegExp(label));
  }
  assert.match(page + table, /provider/i);
  assert.match(page + table, /payer/i);
  assert.match(form, /payerApplicationId/);
  assert.match(actions, /payer_application_id/);
  assert.match(actions, /is_completed/);
  assert.match(actions, /credentialing_specialist/);
});

test('payer workspace shows reference data, active applications, and safe portal link', async () => {
  const [list, detail, query] = await Promise.all([
    read('components/payers/payer-table.tsx'),
    read('components/payers/payer-detail.tsx'),
    read('lib/queries/payers.ts'),
  ]);
  for (const label of ['Electronic Payer ID', 'Credentialing Portal', 'Phone', 'Fax', 'Submission Email', 'Active Applications']) {
    assert.match(list + detail, new RegExp(label));
  }
  assert.match(detail, /target="_blank"/);
  assert.match(detail, /rel="noreferrer noopener"/);
  assert.match(query, /getPayerDetail/);
});
