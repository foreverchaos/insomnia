import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

// Louis: Update defineConfig instead of PlaywrightTestConfig based on practice of playwright offical doc
export default defineConfig({
  projects: [
    {
      // High-confidence smoke/sanity checks, runs on Test App only on Ubuntu
      name: 'Smoke',
      testMatch: /smoke\/.*.test.ts/,
      retries: 0,
    },
    {
      // Single critical path test, runs on release recurring
      name: 'Critical',
      testMatch: /critical\/.*.test.ts/,
      retries: 0,
    },
    {
      // Single critical path test, runs on release recurring
      name: 'Migration',
      testMatch: /migration\/.*.test.ts/,
      retries: 0,
    },
    {
      // Louis temp tests, just for assignment
      name: 'LouisTest',
      testMatch: /assignment-louis\/.*.test.ts/,
      // Louis: Set retry count to 1 due to CI instability.
      retries: isCI ? 1 : 0
    },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://127.0.0.1:4010',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    // Louis: Switch on video recording if needed.
    video: 'retain-on-failure',
    trace: {
      mode: 'retain-on-failure',
      screenshots: true,
      snapshots: true,
      sources: true,
    },
  },
  // Louis: Add github actions reporting which can be attached in workflow result page.
  reporter: process.env.CI ? [['github'], ['list'],['@estruyf/github-actions-reporter', ({
      title: 'Insomnia Test Report - Louis',
      useDetails: true,
      showError: true
    } as GitHubActionOptions)]] : [['list']],
  timeout: process.env.CI ? 60 * 1000 : 20 * 1000,
  forbidOnly: !!process.env.CI,
  outputDir: 'traces',
  testDir: 'tests',
  expect: {
    timeout: process.env.CI ? 25 * 1000 : 10 * 1000,
  },
  workers: 1,
  globalTimeout: 20 * 60 * 1000,
});
