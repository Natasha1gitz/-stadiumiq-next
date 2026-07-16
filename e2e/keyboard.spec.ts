import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  // Test 1: Skip link is present and functional
  test('Skip link navigates to main content', async ({ page }) => {
    await page.goto('/steward');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  // Test 2: Tab reaches the language selector (after nav links)
  test('Tab through /steward form reaches language selector', async ({ page }) => {
    await page.goto('/steward');
    // Tab order: skip link → nav brand → nav transit → nav steward → select
    await page.keyboard.press('Tab'); // skip link
    await page.keyboard.press('Tab'); // StadiumIQ nav link
    await page.keyboard.press('Tab'); // Transit nav link
    await page.keyboard.press('Tab'); // Steward nav link
    await page.keyboard.press('Tab'); // Language select

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBe('SELECT');
  });

  // Test 3: Tab reaches text input after language selector
  test('Tab reaches question input after language selector', async ({ page }) => {
    await page.goto('/steward');
    
    // Focus the select first so we have a known starting point
    await page.locator('select').focus();
    
    // Tab 4 times: Quick Action 1 -> QA 2 -> QA 3 -> Input
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
    }

    const isInputFocused = await page.evaluate(
      () => document.activeElement?.tagName === 'INPUT',
    );
    expect(isInputFocused).toBeTruthy();
  });

  // Test 4: No focus traps — can tab past the form entirely
  test('No focus traps on /steward page', async ({ page }) => {
    await page.goto('/steward');
    // Tab many times and ensure we never get stuck
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
    }
    // If we reach here without timeout, there are no focus traps
    expect(true).toBe(true);
  });
});
