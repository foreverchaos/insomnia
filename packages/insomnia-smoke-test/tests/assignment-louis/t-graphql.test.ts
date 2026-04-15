import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test.describe('GraphQL test', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test.beforeEach(async ({ app, page, insomnia }) => {
    await insomnia.projectPage.importFixture('louis-temp/t-graphql.yaml');
  });

  test('GraphQL with valid variable', async ({ page }) => {
    //The variables are redeclared here and will be moved into the page object subsequently.
    const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    const responseBody = page.getByTestId('response-pane');

    await page.getByTestId('GraphQL request with number').press('Enter');
    await page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();
    await expect.soft(statusTag).toContainText('200 OK');
    await expect.soft(responseBody).toContainText('"echoNum": 777');

    await page.getByRole('button', { name: 'Preview' }).click();
    await page.getByRole('menuitem', { name: 'Raw Data' }).click();
    await expect.soft(responseBody).toContainText('"echoNum": 777');
  });

  test('GraphQL with invalid variable', async ({ page }) => {
    //The variables are redeclared here and will be moved into the page object subsequently.
    const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    const responseBody = page.getByTestId('response-pane');

    await page.getByTestId('GraphQL request with invalid number').press('Enter');
    await page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();
    await expect.soft(statusTag).toContainText('200 OK');
    await expect.soft(responseBody).toContainText('Int cannot represent non 32-bit signed integer value');

    await page.getByRole('button', { name: 'Preview' }).click();
    await page.getByRole('menuitem', { name: 'Raw Data' }).click();
    await expect.soft(responseBody).toContainText('"errors"');
    await expect.soft(responseBody).toContainText('Int cannot represent non 32-bit signed integer value');
  });
});

