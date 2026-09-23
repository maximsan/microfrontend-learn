// Lab 11 in a real browser: one stream per browser, whatever the tabs.
//   npx playwright test labs/11-connection-budget   (LAB_VARIANT=starter to check your copy)
import { test, expect } from '@playwright/test';
import { start, streams, PORT } from '../server.mjs';
import { close } from '../../_shared/serve.mjs';

const variant = process.env.LAB_VARIANT ?? 'solution';
const base = `http://localhost:${PORT}`;
let server;
test.beforeAll(async () => { server = await start({ variant, log: false }); });
test.afterAll(async () => { await close(server); });
// Start every test from a clean slate: the previous test's tabs have closed their streams.
test.beforeEach(async () => { await expect.poll(() => streams().length, { timeout: 10_000 }).toBe(0); });

test.describe('exercise', () => {
  test('all seven micro-frontends get live updates over a single stream', async ({ page }) => {
    await page.goto(base);
    await expect(page.locator('.mf.stale')).toHaveCount(0, { timeout: 8_000 }); // every box has ticked
    await expect.poll(() => streams().length, { message: 'open server-sent-event streams' }).toBe(1);
  });

  test('the page still has connections left for API calls', async ({ page }) => {
    await page.goto(base);
    await page.waitForTimeout(1_500);
    await page.getByRole('button', { name: 'Call the API' }).click();
    await expect(page.locator('#pong')).toContainText('answered', { timeout: 3_000 });
  });

  test('three tabs share one stream, and a new leader takes over when the first closes', async ({ context }) => {
    const tabs = [await context.newPage(), await context.newPage(), await context.newPage()];
    for (const t of tabs) await t.goto(base);
    for (const t of tabs) await expect(t.locator('.mf.stale')).toHaveCount(0, { timeout: 8_000 });
    await expect.poll(() => streams().length).toBe(1);
    const firstLeader = streams()[0];

    // Web Locks are granted in request order, so the first tab is the leader.
    // Closing it must hand the lock — and the stream — to another tab.
    await tabs[0].close();
    await expect.poll(() => streams().length).toBe(1);
    await expect.poll(() => streams()[0]).not.toBe(firstLeader);
    const box = tabs[1].locator('.mf span').first();
    const seen = await box.textContent();
    await expect(box, 'the remaining tabs keep receiving ticks').not.toHaveText(seen, { timeout: 5_000 });
    for (const t of tabs) if (!t.isClosed()) await t.close();
  });
});
