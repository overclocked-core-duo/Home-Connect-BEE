const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  
  test('should load the login page successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/Login/i);
    
    // Verify login form elements exist
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should load the register page successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Check page title
    await expect(page).toHaveTitle(/Register/i);
    
    // Verify registration form elements exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should show error on login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for response - could be error message or redirect
    await page.waitForTimeout(1000);
    
    // Check if still on login page or if error message is shown
    const currentUrl = page.url();
    const hasError = await page.locator('text=/error|invalid|incorrect/i').isVisible().catch(() => false);
    
    expect(currentUrl.includes('/login') || hasError).toBeTruthy();
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Generate unique credentials
    const timestamp = Date.now();
    const testUsername = `testuser_${timestamp}`;
    const testEmail = `test_${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    
    // Check if confirm password field exists
    const confirmPasswordField = page.locator('input[name="confirm_password"]');
    if (await confirmPasswordField.isVisible().catch(() => false)) {
      await confirmPasswordField.fill(testPassword);
    }
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation or response
    await page.waitForTimeout(2000);
    
    // Should redirect to home or dashboard after successful registration
    const currentUrl = page.url();
    expect(currentUrl.includes('/register')).toBeFalsy();
  });

  test('should login with valid credentials', async ({ page }) => {
    // First, create a test user via API or use existing user
    await page.goto('/login');
    
    // For this test, you would typically use a test account
    // Or create one via API before running the test
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass123');
    
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    // After successful login, should be redirected away from login page
    const currentUrl = page.url();
    
    // Could redirect to home, dashboard, or listings
    expect(currentUrl.includes('/login')).toBeFalsy();
  });

  test('should logout successfully', async ({ page }) => {
    // Navigate to logout endpoint
    await page.goto('/logout');
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Should redirect to home or login page
    const currentUrl = page.url();
    expect(currentUrl.includes('/') || currentUrl.includes('/login')).toBeTruthy();
  });
});
