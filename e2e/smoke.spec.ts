import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  // Test 1: Homepage loads
  test('Homepage loads with correct <h1>', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('StadiumIQ');
  });

  // Test 2: /transit loads
  test('/transit loads with heatmap SVG', async ({ page }) => {
    await page.goto('/transit');
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Transit Command Dashboard');
    
    // Check SVG exists
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  // Test 3: /steward loads
  test('/steward loads with chat input', async ({ page }) => {
    await page.goto('/steward');
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Steward Dispatch');
    
    // Check input field exists
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
  });

  // Test 4: Navigation works (manual URLs)
  test('Navigation between routes works', async ({ page }) => {
    await page.goto('/');
    
    await page.goto('/transit');
    await expect(page).toHaveURL(/.*transit/);
    
    await page.goto('/steward');
    await expect(page).toHaveURL(/.*steward/);
  });
});
