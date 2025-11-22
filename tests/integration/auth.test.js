// Authentication flow integration tests
const {
    setupBrowser,
    closeBrowser,
    navigateTo,
    fillField,
    clickAndWait,
    getTextContent,
    generateTestEmail,
    generatePassword,
    BASE_URL
} = require('../setup');

describe('Authentication Flow Tests', () => {
    let browser, page;

    beforeAll(async () => {
        const setup = await setupBrowser();
        browser = setup.browser;
        page = setup.page;
    });

    afterAll(async () => {
        await closeBrowser();
    });

    describe('User Registration', () => {
        test('should successfully register a new user', async () => {
            // Navigate to register page
            await navigateTo(page, `${BASE_URL}/register`);

            // Check if we're on the register page
            const title = await page.title();
            expect(title).toContain('Register');

            // Fill registration form
            const testEmail = generateTestEmail();
            const testPassword = generatePassword();
            const testName = 'Test User';

            // Wait for form elements
            await page.waitForSelector('input[name="name"]', { timeout: 5000 });

            await fillField(page, 'input[name="name"]', testName);
            await fillField(page, 'input[name="email"]', testEmail);
            await fillField(page, 'input[name="password"]', testPassword);

            // Submit form
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
                page.click('button[type="submit"]')
            ]);

            // Check if redirected to home or dashboard
            const currentUrl = page.url();
            expect(currentUrl).toMatch(/(home|dashboard|\/)/i);

            console.log('✓ User registration successful');
        }, 30000);
    });

    describe('User Login', () => {
        test('should successfully login with valid credentials', async () => {
            // First register a user
            await navigateTo(page, `${BASE_URL}/register`);

            const testEmail = generateTestEmail();
            const testPassword = generatePassword();
            const testName = 'Test User Login';

            await page.waitForSelector('input[name="name"]', { timeout: 5000 });
            await fillField(page, 'input[name="name"]', testName);
            await fillField(page, 'input[name="email"]', testEmail);
            await fillField(page, 'input[name="password"]', testPassword);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                page.click('button[type="submit"]')
            ]);

            // Logout
            await navigateTo(page, `${BASE_URL}/api/logout`);

            // Now login
            await navigateTo(page, `${BASE_URL}/login`);

            const loginTitle = await page.title();
            expect(loginTitle).toContain('Login');

            await page.waitForSelector('input[name="email"]', { timeout: 5000 });
            await fillField(page, 'input[name="email"]', testEmail);
            await fillField(page, 'input[name="password"]', testPassword);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                page.click('button[type="submit"]')
            ]);

            // Check successful login
            const loggedInUrl = page.url();
            expect(loggedInUrl).not.toContain('login');

            console.log('✓ User login successful');
        }, 30000);

        test('should show error for invalid credentials', async () => {
            await navigateTo(page, `${BASE_URL}/login`);

            await page.waitForSelector('input[name="email"]', { timeout: 5000 });
            await fillField(page, 'input[name="email"]', 'invalid@test.com');
            await fillField(page, 'input[name="password"]', 'wrongpassword');

            await page.click('button[type="submit"]');

            // Wait a bit to see if error message appears
            await page.waitForTimeout(1000);

            // Should still be on login page or show error
            const currentUrl = page.url();
            const hasError = currentUrl.includes('login') || currentUrl.includes('error');
            expect(hasError).toBe(true);

            console.log('✓ Invalid login handled correctly');
        }, 30000);
    });

    describe('Session Persistence', () => {
        test('should maintain session across page navigation', async () => {
            // Register and login
            await navigateTo(page, `${BASE_URL}/register`);

            const testEmail = generateTestEmail();
            const testPassword = generatePassword();

            await page.waitForSelector('input[name="name"]', { timeout: 5000 });
            await fillField(page, 'input[name="name"]', 'Session Test User');
            await fillField(page, 'input[name="email"]', testEmail);
            await fillField(page, 'input[name="password"]', testPassword);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                page.click('button[type="submit"]')
            ]);

            // Navigate to different pages
            await navigateTo(page, `${BASE_URL}/listings`);
            await page.waitForTimeout(1000);

            await navigateTo(page, `${BASE_URL}/dashboard`);
            await page.waitForTimeout(1000);

            // Check that we're still logged in (should not redirect to login)
            const finalUrl = page.url();
            expect(finalUrl).toContain('dashboard');
            expect(finalUrl).not.toContain('login');

            console.log('✓ Session persistence verified');
        }, 30000);
    });
});
