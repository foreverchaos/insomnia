import { expect, type Page } from '@playwright/test';

import { test } from '../../playwright/test';

const openAndCreateGrpcRequest = async (page: Page) => {
  await page.getByRole('button', { name: 'Create request collection' }).click();
  await page.getByRole('button', { name: 'Create in collection' }).click();
  await page.getByRole('menuitemradio', { name: 'gRPC Request' }).click();
  await expect.soft(page.getByTestId('New Request').getByText('gRPCNew Request')).toBeVisible();
};

const deleteDefaultGrpcRequest = async (page: Page) => {
  await page.getByTestId('My first request').getByText('GETMy first request').hover();
  await page.getByTestId('Dropdown-My-first-request').click();
  await page.getByRole('menuitemradio', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
};

const renameGrpcRequest = async (page: Page, requestName: string) => {
  await page.getByTestId('New Request').getByText('gRPCNew Request').hover();
  await page.getByTestId('Dropdown-New-Request').click();
  await page.getByRole('menuitemradio', { name: 'Rename' }).click();
  await page.getByRole('textbox', { name: 'gRPC New Request' }).fill(`${requestName}\n`);
};

const selectGrpcMethodFromReflection = async (page: Page, methodName: string) => {
  await page.getByTestId('button-server-reflection').click();
  const selectMethodButton = page.getByRole('button', { name: 'Select Method Select gRPC' });
  await expect.soft(selectMethodButton).toBeEnabled();
  await selectMethodButton.click();
  await page.getByRole('option', { name: methodName }).click();
};

const fillGrpcRequestBody = async (page: Page, body: Record<string, unknown>) => {
  await page.getByRole('tab', { name: 'Server Streaming' }).click();
  const bodyArea = page.getByTestId('CodeEditor').getByRole('textbox');
  await bodyArea.focus();
  await bodyArea.press('ControlOrMeta+a');
  await bodyArea.press('Backspace');
  await bodyArea.pressSequentially(JSON.stringify(body));
  /** Trade-Off, we should never use hard delay in tests, but I tried multiple times, it will pop a error message:
   UNKNOWN: Server method handler threw error Cannot read properties of null (reading 'longitude')
   Take this workaround for temperately.
   */
  await page.waitForTimeout(1000);
};

/**
 * GRPC Server Stream test, provide scope of geographic coordinates to get the names of the locations.
 */
test.describe('New GRPC request', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('Create GRPC request - Server Stream', async ({ page, insomnia }) => {
    const requestBody = {
      lo: {
        latitude: '400000000',
        longitude: '-750000000',
      },
      hi: {
        latitude: '420000000',
        longitude: '-730000000',
      },
    };

    await insomnia.projectPage.createProject('Louis GRPC test project', 'local');
    await openAndCreateGrpcRequest(page);
    await deleteDefaultGrpcRequest(page);
    await renameGrpcRequest(page, 'Louis GRPC request - Server Stream');
    await insomnia.workspacePage.fillRequestUrl('localhost:50051');

    await selectGrpcMethodFromReflection(page, '/RouteGuide/ListFeatures');

    await fillGrpcRequestBody(page, requestBody);

    const startButton = page.getByRole('button', { name: 'Start' });
    await expect.soft(startButton).toBeEnabled();
    await insomnia.workspacePage.sendRequest('Start');
    await expect.soft(insomnia.workspacePage.responseStatusTag).toContainText('0 OK');

    /**
     * Only validate the multiple responses from server side with different contents of locations.
     * TODO: Add more validations for response:
     *  - Value of latitude and longitude should be in scope of provided.
     *  - Accuracy of location from response body.
     */
    await expect.soft(page.getByRole('tab', { name: 'Response 10', exact: true })).toBeVisible();
    const tabCount = await page.getByRole('tab', { name: /^Response/ }).count();
    expect.soft(tabCount).toBeGreaterThan(10);

    const responseTab1 = page.getByRole('tab', { name: 'Response 1', exact: true });
    const response10 = await page.getByRole('tab', { name: 'Response 10', exact: true }).textContent();
    await expect.soft(responseTab1).not.toHaveText((response10 ?? '').trim());
  });
});
