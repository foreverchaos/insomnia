import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test.describe('New HTTP request', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('Create a new HTTP GET request and verify', async ({ page, insomnia }) => {
    const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    const responseBody = page.getByTestId('response-pane');

    await insomnia.projectPage.createProject('Louis HTTP Test', 'local');
    await page.getByRole('button', { name: 'Create request collection' }).click();
    await page.getByTestId('My first request').getByText('GETMy first request').hover();
    await page.getByTestId('Dropdown-My-first-request').click();
    await page.getByRole('menuitemradio', { name: 'Rename' }).click();
    await page.getByRole('textbox', { name: 'GET My first request' }).fill('Louis new request - pet\n');
    await page.getByTestId('request-pane').getByTestId('OneLineEditor').first().click();
    await page.getByTestId('request-pane').getByTestId('OneLineEditor').first().pressSequentially('http://127.0.0.1:4010/pets/1');
    await page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();

    await expect.soft(statusTag).toContainText('200 OK');
    await expect.soft(responseBody).toContainText('"id": "1"');

    // Switch to Raw Data view and verify raw JSON
    await page.getByRole('button', { name: 'Preview' }).click();
    await page.getByRole('menuitem', { name: 'Raw Data' }).click();
    await expect.soft(responseBody).toContainText('{"id":"1"}');

    await page.getByRole('button', { name: 'Just Now' }).click();
    await expect.soft(page.getByRole('button', { name: '200 OK GET http://127.0.0.1:' })).toBeVisible();

  });
});

test.describe('HTTP POST request from CURL', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test.beforeEach(async ({ page, insomnia }) => {
    await page.getByLabel('Import').click();
    await page.locator('[data-test-id="import-from-curl"]').click();

    const data = { name: 'louis' }
    await page.getByRole('textbox', { name: 'cURL' }).pressSequentially(`curl --request POST --url http://127.0.0.1:4010/echo --header 'Content-Type: application/json' --data '${JSON.stringify(data)}'`);
    await insomnia.projectPage.scanButton.click()
    await insomnia.projectPage.importButton.click();
  });

  test('Create HTTP POST request from CURL and verify', async ({ page, insomnia }) => {
    const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    const responseBody = page.getByTestId('response-pane');

    const targetUrl = 'http://127.0.0.1:4010/echo'
    await expect.soft(page.getByTestId(targetUrl)).toBeVisible();
    await expect.soft(page.getByTestId('request-pane').getByTestId('OneLineEditor').first()).toContainText(targetUrl)

    await page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();
    await expect.soft(statusTag).toContainText('200 OK');
    await expect.soft(responseBody).toContainText('{\\\"name\\\":\\\"louis\\\"}');

    // Switch to Raw Data view and verify raw JSON
    await page.getByRole('button', { name: 'Preview' }).click();
    await page.getByRole('menuitem', { name: 'Raw Data' }).click();
    await expect.soft(responseBody).toContainText('{\\\"name\\\":\\\"louis\\\"}');


    await page.getByRole('button', { name: 'Just Now' }).click();
    await expect.soft(page.getByRole('button', { name: '200 OK POST http://127.0.0.1:' })).toBeVisible();
  });
});
