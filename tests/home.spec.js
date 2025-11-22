const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Home Connect|Home/i);
    
    // Verify page is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for common navigation links
    const hasAboutLink = await page.locator('a[href="/about"]').isVisible().catch(() => false);
    const hasContactLink = await page.locator('a[href="/contact"]').isVisible().catch(() => false);
    const hasListingsLink = await page.locator('a[href="/listings"]').isVisible().catch(() => false);
    
    // At least one navigation link should exist
    expect(hasAboutLink || hasContactLink || hasListingsLink).toBeTruthy();
  });

  test('should navigate to About page', async ({ page }) => {
    await page.goto('/about');
    
    // Check page loaded
    await expect(page).toHaveTitle(/About/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.goto('/contact');
    
    // Check page loaded
    await expect(page).toHaveTitle(/Contact/i);
    await expect(page.locator('body')).toBeVisible();
  });
});
