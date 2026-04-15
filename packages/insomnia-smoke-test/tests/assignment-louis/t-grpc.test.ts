import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test.describe('New GRPC request', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('Create GRPC request - Server Stream', async ({ page, insomnia }) => {
    const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    const responseBody = page.getByTestId('response-pane');

    const requestBody = {
        lo:{
          "latitude":"400000000",
          "longitude":"-750000000"
        },
        hi:{
          "latitude":"420000000",
          "longitude":"-730000000"
        }
      }

    await insomnia.projectPage.createProject('Louis GRPC test project', 'local');
    await page.getByRole('button', { name: 'Create request collection' }).click();
    await page.getByRole('button', { name: 'Create in collection' }).click();
    await page.getByRole('menuitemradio', { name: 'gRPC Request' }).click();
    await expect.soft(page.getByTestId('New Request').getByText('gRPCNew Request')).toBeVisible();
    
    await page.getByTestId('My first request').getByText('GETMy first request').hover();
    await page.getByTestId('Dropdown-My-first-request').click();
    await page.getByRole('menuitemradio', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    await page.getByTestId('New Request').getByText('gRPCNew Request').hover();
    await page.getByTestId('Dropdown-New-Request').click();
    await page.getByRole('menuitemradio', { name: 'Rename' }).click();
    await page.getByRole('textbox', { name: 'gRPC New Request' }).fill('Louis GRPC request - Server Stream\n');
    await page.getByTestId('request-pane').getByTestId('OneLineEditor').first().click();
    await page.getByTestId('request-pane').getByTestId('OneLineEditor').first().pressSequentially('localhost:50051');

    await page.getByTestId('button-server-reflection').click();
    await expect.soft(page.getByRole('button', { name: 'Select Method Select gRPC' })).toBeEnabled();
    await page.getByRole('button', { name: 'Select Method Select gRPC' }).click();
    await page.getByRole('option', { name: '/RouteGuide/ListFeatures' }).click();

    await page.getByRole('tab', { name: 'Server Streaming' }).click();
    await page.getByTestId('CodeEditor').getByRole('textbox').focus();
    // await page.getByTestId('CodeEditor').getByRole('textbox').clear();

    const bodyArea = page.getByTestId('CodeEditor').getByRole('textbox')
    //trade off, unable to use clear() to remove the original text.
    const selectAllKey = process.platform === 'darwin' ? 'Meta+a' : 'Control+a';
    await bodyArea.press(selectAllKey);
    await bodyArea.press("Backspace");
    await bodyArea.pressSequentially(JSON.stringify(requestBody));
    
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Start' }).click();
    await expect.soft(statusTag).toContainText('0 OK');
    const tabCount = await page.getByRole('tab', { name: 'Response'}).count();
    expect.soft(tabCount).toBeGreaterThan(10);
    
    const responseTab1 = page.getByRole('tab', { name: 'Response 1', exact: true });
    const response10 = await page.getByRole('tab', { name: 'Response 10', exact: true }).textContent();
    await expect.soft(responseTab1).not.toHaveText((response10 ?? '').trim());

    // await page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();

    // await expect.soft(statusTag).toContainText('200 OK');
    // await expect.soft(responseBody).toContainText('"id": "1"');

    // Switch to Raw Data view and verify raw JSON
    // await page.getByRole('button', { name: 'Preview' }).click();
    // await page.getByRole('menuitem', { name: 'Raw Data' }).click();
    // await expect.soft(responseBody).toContainText('{"id":"1"}');

    // await page.getByRole('button', { name: 'Just Now' }).click();
    // await expect.soft(page.getByRole('button', { name: '200 OK GET http://127.0.0.1:' })).toBeVisible();

  });
});
