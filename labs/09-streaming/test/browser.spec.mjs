// Lab 09 in a real browser: hydration and failure isolation.
//   npx playwright test labs/09-streaming          (LAB_VARIANT=starter to check your copy)
import { test, expect } from '@playwright/test';
import { start } from '../server.mjs';

const variant = process.env.LAB_VARIANT ?? 'solution';
const base = 'http://localhost:5109';
let server;
test.beforeAll(async () => { server = await start({ variant, log: false }); });
test.afterAll(async () => { server.closeAllConnections?.(); await new Promise((r) => server.close(r)); });

/** Collect every console message that looks like React giving up on the server's HTML. */
function watchHydration(page) {
  const problems = [];
  page.on('console', (m) => {
    const t = m.text();
    if (/hydrat|\[recoverable\]|did not match|didn't match/i.test(t)) problems.push(t.slice(0, 200));
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));
  return problems;
}

test.describe('observe', () => {
  test('the page streams in and hydrates', async ({ page }) => {
    await page.goto(base);
    await expect(page.getByRole('heading', { name: 'Out-of-order streaming' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Related' })).toBeVisible();
  });
});

test.describe('exercise', () => {
  test.describe('a reader in Tokyo', () => {
    test.use({ timezoneId: 'Asia/Tokyo' });

    test('hydrates without a mismatch, and still sees local time', async ({ page }) => {
      const problems = watchHydration(page);
      await page.goto(base);
      await expect(page.getByRole('heading', { name: 'Out-of-order streaming' })).toBeVisible();
      await page.waitForTimeout(500); // let hydration finish and report
      expect(problems, 'the server (UTC) and the browser (Tokyo) rendered different HTML').toEqual([]);
      // 21:30 UTC on 1 Sept is 06:30 on 2 Sept in Tokyo.
      await expect(page.locator('header time')).toContainText('06:30');
    });
  });

  test('a fragment that crashes in the browser does not take the page down', async ({ page }) => {
    await page.goto(`${base}/?boom`);
    await expect(page.getByRole('heading', { name: 'Out-of-order streaming' })).toBeVisible();
    await expect(page.getByText('Acme blog')).toBeVisible();
    await expect(page.getByText(/Sidebar is unavailable/)).toBeVisible();
  });
});
