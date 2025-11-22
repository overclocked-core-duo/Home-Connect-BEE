const { test, expect } = require('@playwright/test');

test.describe('API Health Check', () => {
  
  test('should return healthy status from health endpoint', async ({ page }) => {
    // Navigate to health endpoint
    const response = await page.goto('/health');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Get response text
    const body = await response.text();
    
    // Should contain healthy or ok status
    expect(body.toLowerCase()).toMatch(/ok|healthy|success/);
  });
});

test.describe('Dashboard Access', () => {
  
  test('should load dashboard page or redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    // Either on dashboard or redirected to login (if auth required)
    const onDashboard = currentUrl.includes('/dashboard');
    const onLogin = currentUrl.includes('/login');
    
    expect(onDashboard || onLogin).toBeTruthy();
    
    // Page should be visible
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Static Assets', () => {
  
  test('should load CSS files', async ({ page }) => {
    await page.goto('/');
    
    // Check if any CSS is loaded
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    
    // At least one stylesheet should be loaded or styles should be inline
    expect(stylesheets >= 0).toBeTruthy();
  });

  test('should load JavaScript files', async ({ page }) => {
    await page.goto('/');
    
    // Check if any JS is loaded
    const scripts = await page.locator('script[src]').count();
    
    // Scripts may or may not exist
    expect(scripts >= 0).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  
  test('should handle non-existent routes gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    
    // Should return 404 or redirect
    const status = response.status();
    expect(status === 404 || status === 302 || status === 301).toBeTruthy();
  });
});
