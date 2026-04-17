import { expect } from '@playwright/test';

import type { InsomniaApp } from '../../playwright/pages/insomnia-app';
import { test } from '../../playwright/test';

const openAndSendGraphqlRequest = async (insomnia: InsomniaApp, requestTestId: string) => {
  await insomnia.workspacePage.openRequestByTestId(requestTestId);
  await insomnia.workspacePage.sendRequest('Send');
};

const assertGraphqlResponse = async (insomnia: InsomniaApp, expectedText: string, expectedStatus = '200 OK') => {
  await expect.soft(insomnia.workspacePage.responseStatusTag).toContainText(expectedStatus);
  await expect.soft(insomnia.workspacePage.responsePane).toContainText(expectedText);
};

const switchToRawDataAndAssert = async (insomnia: InsomniaApp, expectedText: string) => {
  await insomnia.workspacePage.switchResponseToRawData();
  await expect.soft(insomnia.workspacePage.responsePane).toContainText(expectedText);
};

/**
 * Use predefined yaml file to test echoNum function of GraphQL.
 * Input variable with 32-bit integer and non 32-bit integer separately.
 */
test.describe('GraphQL test', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test.beforeEach(async ({ insomnia }) => {
    await insomnia.projectPage.importFixture('louis-temp/t-graphql.yaml');
  });

  test('GraphQL with 32-bit integer', async ({ insomnia }) => {
    await openAndSendGraphqlRequest(insomnia, 'GraphQL request with number');
    await assertGraphqlResponse(insomnia, '"echoNum": 777');
    await switchToRawDataAndAssert(insomnia, '"echoNum": 777');
  });

  test('GraphQL with non 32-bit integer', async ({ insomnia }) => {
    await openAndSendGraphqlRequest(insomnia, 'GraphQL request with invalid number');
    await assertGraphqlResponse(insomnia, 'Int cannot represent non 32-bit signed integer value');

    await insomnia.workspacePage.switchResponseToRawData();
    await expect.soft(insomnia.workspacePage.responsePane).toContainText('"errors"');
    await expect.soft(insomnia.workspacePage.responsePane).toContainText('Int cannot represent non 32-bit signed integer value');
  });
});
