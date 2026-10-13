import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=(p)=>readFile(new URL(`../../${p}`,import.meta.url),'utf8');

test('workspace has shared loading, error, permission, and visible focus states',async()=>{
  const [layout,loading,error,permission,skeleton,dataError,css]=await Promise.all([
    read('app/(workspace)/layout.tsx'),read('app/(workspace)/loading.tsx'),read('app/(workspace)/error.tsx'),read('components/shared/permission-denied.tsx'),read('components/shared/loading-skeleton.tsx'),read('components/shared/data-error.tsx'),read('app/globals.css')
  ]);
  assert.match(layout,/PermissionDenied/);
  assert.match(loading,/LoadingSkeleton/);
  assert.match(error,/DataError/);
  assert.match(permission,/Permission denied/);
  assert.match(skeleton,/aria-busy/);
  assert.match(dataError,/Try again/);
  assert.match(css,/:focus-visible/);
});

test('mobile navigation and operational queues have keyboard-safe responsive fallbacks',async()=>{
  const [topbar,priority,tasks,drawer]=await Promise.all([
    read('components/layout/topbar.tsx'),read('components/dashboard/priority-queue.tsx'),read('components/tasks/task-table.tsx'),read('components/shared/modal-drawer.tsx')
  ]);
  assert.match(topbar,/aria-label="Mobile primary"/);
  assert.match(topbar,/md:hidden/);
  assert.match(priority,/sm:hidden/);
  assert.match(tasks,/sm:hidden/);
  assert.match(drawer,/showModal/);
  assert.match(drawer,/data-drawer-trigger/);
});
