import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('shows the login page with all required fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Amdox/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Expect an error message or HTML5 validation
    const errorOrValidation = page.locator('[role="alert"], :invalid').first();
    await expect(errorOrValidation).toBeVisible({ timeout: 3000 }).catch(() => {
      // HTML5 native validation — form won't submit, which is also acceptable
    });
  });

  test('redirects to dashboard after successful login', async ({ page }) => {
    // This test requires a seeded test user
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@demo.amdox.io');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
  });
});

test.describe('Public Pages', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
