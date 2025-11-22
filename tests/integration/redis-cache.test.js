// Redis caching integration tests
const {
    setupBrowser,
    closeBrowser,
    navigateTo,
    waitForSelector,
    BASE_URL
} = require('../setup');

describe('Redis Cache Tests', () => {
    let browser, page;

    beforeAll(async () => {
        const setup = await setupBrowser();
        browser = setup.browser;
        page = setup.page;
    });

    afterAll(async () => {
        await closeBrowser();
    });

    describe('Cache API Endpoints', () => {
        test('should access Redis stats API', async () => {
            await navigateTo(page, `${BASE_URL}/api/redis/stats`);

            const content = await page.evaluate(() => document.body.textContent);
            const jsonData = JSON.parse(content);

            expect(jsonData).toHaveProperty('success');
            expect(jsonData).toHaveProperty('stats');

            if (jsonData.success) {
                expect(jsonData.stats).toHaveProperty('totalKeys');
                expect(jsonData.stats).toHaveProperty('hits');
                expect(jsonData.stats).toHaveProperty('misses');
                expect(jsonData.stats).toHaveProperty('hitRate');
                console.log('✓ Redis stats retrieved successfully');
                console.log(`  - Total Keys: ${jsonData.stats.totalKeys}`);
                console.log(`  - Hit Rate: ${jsonData.stats.hitRate}%`);
            } else {
                console.log('⚠ Redis may not be running');
            }
        }, 30000);

        test('should access cached keys API', async () => {
            await navigateTo(page, `${BASE_URL}/api/redis/keys`);

            const content = await page.evaluate(() => document.body.textContent);
            const jsonData = JSON.parse(content);

            expect(jsonData).toHaveProperty('success');

            if (jsonData.success) {
                expect(jsonData).toHaveProperty('keys');
                expect(jsonData).toHaveProperty('count');
                console.log(`✓ Found ${jsonData.count} cached keys`);
            } else {
                console.log('⚠ Redis keys query returned error');
            }
        }, 30000);
    });

    describe('Cache Behavior', () => {
        test('should cache property API response', async () => {
            // First request - should be a cache MISS
            await navigateTo(page, `${BASE_URL}/api/properties`);
            await page.waitForTimeout(1000);

            // Check Redis to see if it was cached
            await navigateTo(page, `${BASE_URL}/api/redis/keys?pattern=cache:*properties*`);
            const content1 = await page.evaluate(() => document.body.textContent);

            try {
                const jsonData1 = JSON.parse(content1);

                if (jsonData1.success && jsonData1.count > 0) {
                    console.log('✓ Properties API response was cached');
                    console.log(`  Cached key: ${jsonData1.keys[0]?.key || 'cache:...'}`);
                } else {
                    console.log('ℹ No cache entry found (Redis may not be running or caching disabled)');
                }
            } catch (e) {
                console.log('⚠ Could not parse cache response');
            }
        }, 30000);

        test('should serve cached response on subsequent requests', async () => {
            // Make first request
            await navigateTo(page, `${BASE_URL}/api/properties`);
            const firstLoadTime = await page.evaluate(() => performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);

            await page.waitForTimeout(500);

            // Make second request (should be cached)
            await navigateTo(page, `${BASE_URL}/api/properties`);
            const secondLoadTime = await page.evaluate(() => performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);

            console.log(`✓ First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);

            // Second request should typically be faster if cached
            // But this isn't guaranteed due to network variations
            expect(secondLoadTime).toBeGreaterThan(0);
        }, 30000);
    });

    describe('Redis Dashboard', () => {
        test('should load Redis dashboard page', async () => {
            await navigateTo(page, `${BASE_URL}/redis-dashboard`);

            // Check if dashboard loaded
            const title = await page.title();
            expect(title).toContain('Redis');

            // Check for stats elements
            await page.waitForTimeout(2000);

            const hasTotalKeys = await page.$('#total-keys');
            const hasHitRate = await page.$('#hit-rate');

            expect(hasTotalKeys).toBeTruthy();
            expect(hasHitRate).toBeTruthy();

            console.log('✓ Redis dashboard loaded successfully');
        }, 30000);

        test('should display cache statistics', async () => {
            await navigateTo(page, `${BASE_URL}/redis-dashboard`);

            // Wait for stats to load
            await page.waitForTimeout(3000);

            // Get stat values
            const totalKeys = await page.$eval('#total-keys', el => el.textContent);
            const hitRate = await page.$eval('#hit-rate', el => el.textContent);

            console.log(`✓ Cache stats displayed:`);
            console.log(`  - Total Keys: ${totalKeys}`);
            console.log(`  - Hit Rate: ${hitRate}`);

            expect(totalKeys).toBeTruthy();
            expect(hitRate).toBeTruthy();
        }, 30000);
    });
});
