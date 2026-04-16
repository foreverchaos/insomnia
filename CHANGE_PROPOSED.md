## Proposals - Configuration
### `playwright.config.ts`
- This is already included in the PR. Please refer to the PR comments for details.

## Proposals - Test Suites

### critical

#### `backup.test.ts`
- Seems `dataPath` fixture is equivalent to the following runtime function. If yes, it should be replaced:
```ts
const dataPath = await app.evaluate(async ({ app }) => app.getPath('userData'));
```
- The following logic accesses `rootBackupsFolder[0]` directly, which may cause an NPE. Add wait/polling check at least one backup directory is created:
```ts
const backupDir = await fs.promises.readdir(path.join(dataPath, 'backups', rootBackupsFolder[0]));
```
- There are multiple test data under `fixtures/inso-nedb`. Consider extending test coverage to validate those datasets explicitly.

#### `bundling.test.ts`
- 4 tests in one flow (bundled plugins, node-libcurl, httpsnippet, hidden browser window). Consider splitting them into independent tests to improve maintainability.
- `new InsomniaApp(page, app)` should be replaced with the existing `insomnia` fixture:
```ts
test('', async ({ insomnia, page }) => {})
```

#### `certificates.test.ts`
- The `fixtures/certificates` directory includes an mTLS certificate chain (`client.crt` / `client.key`). Consider adding dedicated mTLS coverage in tests.

#### `can open scratchpad`
- Assertions seems insufficient. Add more validations for core Scratchpad behavior:
  - Basic request execution
  - Post-signup navigation correctness
  - Data isolation (e.g., create a project, log out, verify project is not visible in Scratchpad context)

## smoke

#### `after-response-script-features.test.ts`
- Suggest to split into multiple focused tests and move fixture import into `beforeEach`.
- `new InsomniaApp(page, app)` should be replaced with the `insomnia` fixture.
```ts
test.describe('after-response script features tests', () => {
  test.beforeEach(async ({ page, app }) => {
    await importFixtures(page, app);
  });
  test('transient variables', async ({ page }) => { ... });
  test('insomnia.test and insomnia.expect work together', async ({ page }) => { ... });
  test('environment and baseEnvironment can be persisted', async ({ page }) => { ... });
  test('globals and baseGlobals can be persisted', async ({ page }) => { ... });
});
```

#### `app.test.ts`
- Suggest to split into multiple focused tests and move `importFixture` into `beforeEach`.
```ts
test.describe('can send requests', () => {
  test.beforeEach(async ({ insomnia }) => {
    await insomnia.projectPage.importFixture('smoke-test-collection.yaml');
  });
  test('import from curl and send GET request', ...);
  test('send JSON request and switch response views', ...);
  test('cookie handling', ...);
  test('cancel in-flight request', ...);
  ...
});
```

#### `chained-responses.test.ts`
- importFixture fixture already exists
```ts
// original impl
const text = await loadFixture('chained-responses.yaml');
await app.evaluate(async ({ clipboard }, text) => clipboard.writeText(text), text);
await page.getByLabel('Import').click();

// enhanced impl
await insomnia.projectPage.importFixture('chained-responses.yaml');
```

#### `mtls.test.ts`
- Scenario coverage is strong, but the test title (`can use client certificate for mTLS`) understates the actual scope, which includes certificate disable/enable transitions. Split into multiple tests with precise intent.
- importFixture fixture already exists
```ts
// original impl
const clientCertsCollectionText = await loadFixture('client-certs.yaml');
await app.evaluate(async ({ clipboard }, text) => clipboard.writeText(text), clientCertsCollectionText);

// enhanced impl
await insomnia.projectPage.importFixture('client-certs.yaml');
```

#### `oauth.test.ts`
- Coverage is excellent and detailed. Similar to `mtls.test.ts`, consider decomposing the long end-to-end chain into independent tests, for example:
```ts
test('No PKCE', ...);
test('PKCE SHA256', ...);
test('Inherited Auth from folder', ...);
...
```
- importFixture fixture already exists
```ts
// original impl
const text = await loadFixture('oauth.yaml');
await app.evaluate(async ({ clipboard }, text) => clipboard.writeText(text), text);

// enhanced impl
await insomnia.projectPage.importFixture('oauth.yaml');
```
- The file is ~200 lines. Consider extracting shared helper functions to improve readability and maintainability.

#### `openapi.test.ts`
- Add bidirectional lint state validation: after introducing a lint error, also validate recovery back to `No lint problems` once fixed.
- Add assertions for detailed lint diagnostics in the lint panel.
- Extend test coverage (e.g., schema mutation behavior, large YAML performance/stability).
