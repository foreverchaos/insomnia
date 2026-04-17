# Changelog

## Summary
- Added new Playwright test suites for HTTP, GraphQL, and gRPC scenarios based on the assignment requirements.
- Dev environment: Win11

## Created Files

### 1) `packages/insomnia-smoke-test/assignment-louis`
- New directory containing the Louis assignment Playwright test suites.

### 2) `packages/insomnia-smoke-test/fixtures/louis-temp`
- Added fixture data used by the assignment test suites.

### 3) `.github/workflows/test-louis.yml`
- Added a dedicated GitHub Actions workflow to run the `Louis Test` Playwright project in CI.

## Updated Files

### 1) `packages/insomnia-smoke-test/playwright.config.ts`
- Migrated configuration to `defineConfig`.
- Added CI-aware retry behavior for the `Louis Test` project.
- Enabled video capture retention on test failure.
- Updated CI reporter configuration (GitHub Actions reporter).

### 2) `packages/insomnia-smoke-test/playwright/pages/project/index.ts`
- Added `importFromCurl(curlCommand: string)` to standardize and reuse the cURL import flow in tests.

### 3) `packages/insomnia-smoke-test/playwright/pages/workspace/index.ts`
- Added reusable workspace locators and actions to reduce duplicated test logic:
  - `responseStatusTag`
  - `responsePane`
  - `requestPane`
  - `sendRequest(action)`
  - `switchResponseToRawData()`
  - `openRequestByTestId(requestTestId)`
  - `fillRequestUrl(url)`

### 4) `packages/insomnia/config/config.json`
- Temporarily removed bundle plugins `@kong/insomnia-plugin-external-vault` and `@kong/insomnia-plugin-ai` to prevent CI failures in fork-based workflows where `GITHUB_TOKEN` package authorization is insufficient.


## Design Consideration & Assumption
- Included in the comments from code base.


## Quick-start
- This document is largely derived from the original smoke-test README, with only the target test directory modified.

Prerequisites:

- Clone the project
- Run `npm install`

To run all tests:

- In one terminal run: `npm run watch:app` OR `npm run dev`
- In another terminal run: `npm run test:smoke:dev`

To run single tests:
- Use playwright UI `npm run test:dev -w insomnia-smoke-test -- --project=LouisTest --ui` to show all tests by project
