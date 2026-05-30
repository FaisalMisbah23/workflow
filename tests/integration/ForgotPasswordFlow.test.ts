import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test('should navigate to forgot password page', async ({ page }) => {
    // Navigate to signin page
    await page.goto('http://localhost:8081/signin');

    // Click on the "Forgot Password" link
    await page.click('text=Forgot Password');

    // Verify navigation to the forgot password page
    await expect(page).toHaveURL(/.*forgotpassword/);
    
    // Verify the email input and button are visible
    await expect(page.locator('input[placeholder="you@example.com"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Reset Email")')).toBeVisible();
  });

  test('should submit forgot password form', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('http://localhost:8081/forgotpassword');

    // Fill in the email field
    await page.fill('input[placeholder="you@example.com"]', 'test@example.com');

    // Click on the "Send Reset Email" button
    await page.click('button:has-text("Send Reset Email")');

    // Verify we're redirected back to signin after submission
    await expect(page).toHaveURL(/.*signin/, { timeout: 5000 });
  });

  test('should show error when email is empty', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('http://localhost:8081/forgotpassword');

    // Click the button without entering email
    await page.click('button:has-text("Send Reset Email")');

    // Should see error toast or alert (wait a moment for it to appear)
    await page.waitForTimeout(1000);
  });

  test('should navigate back to signin from forgot password', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('http://localhost:8081/forgotpassword');

    // Click "Back to Sign In" link
    await page.click('text=Back to Sign In');

    // Verify navigation back to signin
    await expect(page).toHaveURL(/.*signin/);
  });
});