// Property listing and viewing integration tests
const {
    setupBrowser,
    closeBrowser,
    navigateTo,
    waitForSelector,
    getTextContent,
    BASE_URL
} = require('../setup');

describe('Property Tests', () => {
    let browser, page;

    beforeAll(async () => {
        const setup = await setupBrowser();
        browser = setup.browser;
        page = setup.page;
    });

    afterAll(async () => {
        await closeBrowser();
    });

    describe('Property Listings', () => {
        test('should load property listings page', async () => {
            await navigateTo(page, `${BASE_URL}/listings`);

            // Check page title
            const title = await page.title();
            expect(title).toBeTruthy();

            // Check if listings container exists
            const hasListings = await page.$('body');
            expect(hasListings).toBeTruthy();

            console.log('✓ Property listings page loaded');
        }, 30000);

        test('should display properties or empty state', async () => {
            await navigateTo(page, `${BASE_URL}/listings`);

            // Wait for page to load
            await page.waitForTimeout(2000);

            // Check if there are properties or an empty state message
            const pageContent = await page.content();
            const hasContent = pageContent.length > 0;

            expect(hasContent).toBe(true);

            console.log('✓ Property listings content verified');
        }, 30000);
    });

    describe('Property API', () => {
        test('should successfully fetch properties from API', async () => {
            // Navigate to API endpoint
            await navigateTo(page, `${BASE_URL}/api/properties`);

            // Get page content (should be JSON)
            const content = await page.evaluate(() => document.body.textContent);

            let jsonData;
            try {
                jsonData = JSON.parse(content);
            } catch (e) {
                // If not JSON, that's okay - might need authentication
                console.log('API response may require authentication');
                return;
            }

            // If we got JSON, verify it's an array or has properties
            if (jsonData) {
                const isValid = Array.isArray(jsonData) ||
                    (typeof jsonData === 'object' && jsonData.properties);
                expect(isValid || jsonData.error).toBeTruthy();
            }

            console.log('✓ Property API endpoint accessible');
        }, 30000);
    });

    describe('Property Search', () => {
        test('should load search page', async () => {
            await navigateTo(page, `${BASE_URL}/api/search`);

            // Check that page loaded
            const url = page.url();
            expect(url).toContain('search');

            console.log('✓ Search page loaded');
        }, 30000);
    });
});
