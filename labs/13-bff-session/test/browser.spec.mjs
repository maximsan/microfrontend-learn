// Lab 13 in a real browser: what an injected script can reach, and logout across tabs.
//   npx playwright test labs/13-bff-session        (VARIANT=starter to check your copy)
// Needs a browser that accepts Secure cookies on http://localhost: Chrome, Chromium, Firefox.
import { test, expect } from '@playwright/test';
import { readVariant } from '../../_shared/variant.mjs';

const variant = readVariant();
const APP = 'http://localhost:5122';
let stack;
test.beforeAll(async () => {
  const { startAll } = await import('../start.mjs');
  stack = await startAll({ variant, log: false });
});
test.afterAll(async () => { await stack.close(); });

async function signIn(page) {
  await page.goto(APP);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`${APP}/`);
  await expect(page.locator('#who')).toContainText(/Signed in/);
}

test.describe('observe', () => {
  test('signing in works end to end', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Load orders' }).click();
    await expect(page.locator('#out')).toContainText('Keyboard');
  });
});

test.describe('exercise', () => {
  test('an injected script finds no OAuth token to steal', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Run the injected script' }).click();
    const loot = page.locator('#loot');
    await expect(loot).not.toHaveText('(nothing yet)');
    await expect(loot, 'tokens are readable from page script').not.toContainText(/access_token|refresh_token/);
    // And the session cookie itself is invisible to script.
    expect(await page.evaluate(() => document.cookie)).not.toMatch(/__Host-session/);
  });

  test('signing out in one tab signs out the others', async ({ context }) => {
    const a = await context.newPage();
    await signIn(a);
    const b = await context.newPage();
    await b.goto(APP);
    await expect(b.locator('#who')).toContainText(/Signed in/);

    await a.getByRole('button', { name: 'Sign out' }).click();
    await expect(b.locator('#out')).toContainText('Signed out in another tab');
    await expect(b.locator('#who')).toContainText('Not signed in');
  });
});
