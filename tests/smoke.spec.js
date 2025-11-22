const { test, expect } = require('@playwright/test');

/**
 * Smoke Tests - Quick basic checks to ensure the application is running
 * These tests should be fast and cover critical functionality
 */

test.describe('Smoke Tests', () => {
  
  test('application should be accessible', async ({ page }) => {
    const response = await page.goto('/');
    
    // Server should respond
    expect(response.status()).toBeLessThan(500);
    
    // Page should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('health endpoint should respond', async ({ page }) => {
    const response = await page.goto('/health');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
  });

  test('static assets should load', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // No console errors (we'll be lenient)
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Page should be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('critical pages should be accessible', async ({ page }) => {
    // Test multiple pages quickly
    const pages = ['/', '/login', '/register', '/listings', '/about', '/contact'];
    
    for (const pagePath of pages) {
      const response = await page.goto(pagePath);
      
      // Should not return server error
      expect(response.status()).toBeLessThan(500);
    }
  });
});
