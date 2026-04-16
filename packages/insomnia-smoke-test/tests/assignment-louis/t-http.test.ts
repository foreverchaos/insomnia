import { expect, type Page } from '@playwright/test';

import type { InsomniaApp } from '../../playwright/pages/insomnia-app';
import { test } from '../../playwright/test';

const createAndRenameHttpRequest = async (page: Page, requestName: string) => {
  await page.getByRole('button', { name: 'Create request collection' }).click();
  await page.getByTestId('My first request').getByText('GETMy first request').hover();
  await page.getByTestId('Dropdown-My-first-request').click();
  await page.getByRole('menuitemradio', { name: 'Rename' }).click();
  await page.getByRole('textbox', { name: 'GET My first request' }).fill(`${requestName}\n`);
};

const sendAndAssertHttpResponse = async (
  insomnia: InsomniaApp,
  expectedBody: string,
  expectedRawBody: string,
  expectedStatus = '200 OK',
) => {
  await insomnia.workspacePage.sendRequest('Send');
  await expect.soft(insomnia.workspacePage.responseStatusTag).toContainText(expectedStatus);
  await expect.soft(insomnia.workspacePage.responsePane).toContainText(expectedBody);

  await insomnia.workspacePage.switchResponseToRawData();
  await expect.soft(insomnia.workspacePage.responsePane).toContainText(expectedRawBody);
};

const assertHistoryEntryVisible = async (page: Page, historyText: string) => {
  await page.getByRole('button', { name: 'Just Now' }).click();
  await expect.soft(page.getByRole('button', { name: historyText })).toBeVisible();
};
/**
 * 2 tests for HTTP requests
 * - Http GET request created by URL inputs
 * - Http POST request created from cUrl inputs.
 */

test.describe('New HTTP request', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('Create HTTP GET request', async ({ page, insomnia }) => {
    await insomnia.projectPage.createProject('Louis HTTP Test', 'local');
    await createAndRenameHttpRequest(page, 'Louis new request - pet');
    await insomnia.workspacePage.fillRequestUrl('http://127.0.0.1:4010/pets/1');
    await sendAndAssertHttpResponse(insomnia, '"id": "1"', '{"id":"1"}');
    await assertHistoryEntryVisible(page, '200 OK GET http://127.0.0.1:');
  });
});

test.describe('HTTP POST request from CURL', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test.beforeEach(async ({ insomnia }) => {
    const data = { name: 'Louis' };
    await insomnia.projectPage.importFromCurl(
      `curl --request POST --url http://127.0.0.1:4010/echo --header 'Content-Type: application/json' --data '${JSON.stringify(data)}'`,
    );
  });

  test('Create HTTP POST request from CURL', async ({ page, insomnia }) => {
    const targetUrl = 'http://127.0.0.1:4010/echo';
    await expect.soft(page.getByTestId(targetUrl)).toBeVisible();
    await expect.soft(insomnia.workspacePage.requestPane.getByTestId('OneLineEditor').first()).toContainText(targetUrl);
    await sendAndAssertHttpResponse(insomnia, '{\\"name\\":\\"Louis\\"}', '{\\"name\\":\\"Louis\\"}');
    await assertHistoryEntryVisible(page, '200 OK POST http://127.0.0.1:');
  });
});
