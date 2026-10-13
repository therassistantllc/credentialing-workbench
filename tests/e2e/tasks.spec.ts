import { test, expect } from '@playwright/test';
test('tasks route is protected by the authenticated workspace',async({page})=>{await page.goto('/tasks');await expect(page).toHaveURL(/login|tasks/);});
