# Integration Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for browser-based integration testing.

## Overview

Playwright is a modern browser automation framework that allows you to test your web application across Chromium, Firefox, and WebKit browsers.

## Test Structure

- `tests/auth.spec.js` - Authentication flow tests (login, register, logout)
- `tests/home.spec.js` - Home page and navigation tests
- `tests/properties.spec.js` - Property listing and search tests
- `tests/general.spec.js` - API health checks and general functionality tests

## Prerequisites

Before running tests, make sure:
1. Your server is running on `http://localhost:8080`
2. MongoDB is running and accessible
3. All required environment variables are set

## Running Tests

### Start the server first
```bash
npm start
```

### Run all tests (headless mode)
```bash
npm test
```

### Run tests with browser visible (headed mode)
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test tests/auth.spec.js
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Configuration

Test configuration is in `playwright.config.js`. You can modify:
- Base URL (default: `http://localhost:8080`)
- Browser settings
- Test timeouts
- Number of retries
- Parallel execution settings

## Writing New Tests

Example test structure:
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Debugging Tests

### Run in debug mode
```bash
npx playwright test --debug
```

### Run with Playwright Inspector
```bash
PWDEBUG=1 npx playwright test
```

### Generate code by recording actions
```bash
npx playwright codegen http://localhost:8080
```

## CI/CD Integration

Tests are configured to run in CI environments with:
- Automatic retries on failure
- Screenshot capture on failures
- Video recording of failed tests
- Trace collection for debugging

## Troubleshooting

### Tests failing due to server not running
Make sure your server is running before executing tests. You can uncomment the `webServer` configuration in `playwright.config.js` to auto-start the server.

### Timeout errors
Increase the timeout in `playwright.config.js` if your application takes longer to load.

### Browser installation
If browsers are not installed, run:
```bash
npx playwright install
```

## Learn More

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
