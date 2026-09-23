// Browser tests for the labs and the capstone.
//
//   npm run test:browser            reference solutions — everything should pass
//   npm run test:browser:starter    the starters — every "exercise" test should fail
//   npx playwright test labs/06-router --project=chrome     one lab
//
// Tests start the lab's own servers on fixed ports, so they run one file at a time.
// "chrome" uses the Google Chrome you already have; "chromium" and "firefox" need
// `npx playwright install chromium firefox` once.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['labs/*/test/*.spec.mjs', 'capstone/test/*.spec.mjs'],
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list']],
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
