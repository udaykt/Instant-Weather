import { test, expect } from '@playwright/test';

test('landing page loads with correct heading and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.home-greeting')).toContainText('Instant Weather');
  await expect(page.locator('.home-button')).toBeVisible();
  await expect(page.locator('.home-button')).toHaveAttribute('href', 'weather.html');
});

test('landing page shows all feature chips', async ({ page }) => {
  await page.goto('/');
  const chips = page.locator('.home-feature-chip');
  await expect(chips).toHaveCount(5);
});

test('weather page loads and renders skeleton state', async ({ page }) => {
  await page.goto('/weather.html');
  await expect(page.locator('#main-block')).toBeVisible();
  await expect(page.locator('.search-box')).toBeVisible();
  await expect(page.locator('.temperature-degree')).toBeVisible();
});

test('navigates from landing to weather page', async ({ page }) => {
  await page.goto('/');
  await page.click('.home-button');
  await expect(page).toHaveURL(/weather\.html/);
  await expect(page.locator('#main-block')).toBeVisible();
});
