// Browser tests for the labs and the capstone.
//
//   npm run test:browser            reference solutions — everything should pass
//   npm run test:browser:starter    the starters — every "exercise" test should fail
//   npx playwright test labs/06-router --project=chrome     one lab
//
// Each test file starts its lab's servers on that lab's own ports (see labs/README.md),
// so different files run in parallel, one worker each. Tests inside a file share
// its servers and run in order. Running several browsers in one go would put the
// same file in two workers on the same ports: add --workers=1 when you do that.
// PW_WORKERS=<n> overrides the worker count.
// "chrome" uses the Google Chrome you already have; "chromium" and "firefox" need
// `npx playwright install chromium firefox` once.
import os from 'node:os';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Files are the unit of parallelism, so workers beyond the number of spec files sit idle.
const workers = Number(process.env.PW_WORKERS) || Math.max(1, os.availableParallelism() - 1);

export default defineConfig({
  testDir: '.',
  testMatch: ['labs/*/test/*.spec.mjs', 'capstone/test/*.spec.mjs'],
  // Playwright prefixes every glob with **/, so the patterns above also match the
  // copies in .claude/worktrees/, which load their own Playwright and abort the run.
  testIgnore: new RegExp(`^${RegExp.escape(path.join(import.meta.dirname, '.claude'))}/`),
  fullyParallel: false,
  workers,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    // Starters are meant to fail: fail fast instead of burning the whole test
    // timeout on a click that can never happen (the default action timeout is none).
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
