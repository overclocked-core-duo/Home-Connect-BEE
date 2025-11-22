// Test setup and helper functions for Puppeteer integration tests
const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';
const HEADLESS = process.env.HEADLESS !== 'false'; // Set to false to see browser

let browser;
let page;

/**
 * Setup browser before all tests
 */
async function setupBrowser() {
    browser = await puppeteer.launch({
        headless: HEADLESS,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 0 // Add delay for debugging if needed
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    return { browser, page };
}

/**
 * Close browser after all tests
 */
async function closeBrowser() {
    if (browser) {
        await browser.close();
    }
}

/**
 * Navigate to a URL with retry logic
 */
async function navigateTo(targetPage, url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await targetPage.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
            return;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

/**
 * Wait for selector with timeout
 */
async function waitForSelector(targetPage, selector, timeout = 5000) {
    try {
        await targetPage.waitForSelector(selector, { timeout });
        return true;
    } catch (error) {
        console.error(`Selector ${selector} not found within ${timeout}ms`);
        return false;
    }
}

/**
 * Fill form field
 */
async function fillField(targetPage, selector, value) {
    await targetPage.waitForSelector(selector);
    await targetPage.click(selector);
    await targetPage.type(selector, value);
}

/**
 * Click and wait for navigation
 */
async function clickAndWait(targetPage, selector) {
    await Promise.all([
        targetPage.waitForNavigation({ waitUntil: 'networkidle2' }),
        targetPage.click(selector)
    ]);
}

/**
 * Get text content of element
 */
async function getTextContent(targetPage, selector) {
    const element = await targetPage.$(selector);
    if (!element) return null;
    return await targetPage.evaluate(el => el.textContent, element);
}

/**
 * Take screenshot for debugging
 */
async function takeScreenshot(targetPage, name) {
    const timestamp = Date.now();
    await targetPage.screenshot({
        path: `./tests/screenshots/${name}-${timestamp}.png`,
        fullPage: true
    });
}

/**
 * Generate random email for testing
 */
function generateTestEmail() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test-${timestamp}-${random}@homeconnect.test`;
}

/**
 * Generate random password
 */
function generatePassword() {
    return `Test${Math.random().toString(36).substring(2, 10)}!123`;
}

module.exports = {
    setupBrowser,
    closeBrowser,
    navigateTo,
    waitForSelector,
    fillField,
    clickAndWait,
    getTextContent,
    takeScreenshot,
    generateTestEmail,
    generatePassword,
    BASE_URL
};
