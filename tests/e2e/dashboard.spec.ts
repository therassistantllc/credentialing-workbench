import { test, expect } from '@playwright/test';
test.skip(!process.env.E2E_AUTH_STORAGE,'requires authenticated storage state');
test('dashboard routes open tasks KPI to filtered queue',async({page})=>{await page.goto('/dashboard');await expect(page.getByText('Open Tasks')).toBeVisible();await page.getByText('Open Tasks').click();await expect(page).toHaveURL(/\/tasks\?status=open/);});
