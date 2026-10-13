import { test,expect } from '@playwright/test';
test('documents remain behind authentication',async({page})=>{await page.goto('/documents');await expect(page).toHaveURL(/login|documents/);});
