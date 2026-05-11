const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

const extensionPath = path.resolve(__dirname, '..');

test('popup loads and scan button is visible', async () => {
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    let serviceWorkerURL;
    const existingWorkers = context.serviceWorkers();
    if (existingWorkers.length > 0) {
        serviceWorkerURL = existingWorkers[0].url();
    } else {
        const worker = await context.waitForEvent('serviceworker', {
            predicate: worker => worker.url().includes('background'),
            timeout: 10000
        });
        serviceWorkerURL = worker.url();
    }

    const extensionId = serviceWorkerURL.split('/')[2];

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

    const scanButton = popupPage.locator('#scanButton');
    await expect(scanButton).toBeVisible();

    await context.close();
});