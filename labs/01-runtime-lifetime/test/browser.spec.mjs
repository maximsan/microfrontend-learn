// Lab 01 in a real browser.   npx playwright test labs/01-runtime-lifetime
// "observe" tests describe the platform and pass on both variants.
// "exercise" tests fail on the starter until you fix it (VARIANT=starter).
import { test, expect } from '@playwright/test';
import { start, PORT } from '../server.mjs';
import { close } from '../../_shared/serve.mjs';
import { readVariant } from '../../_shared/variant.mjs';

const variant = readVariant();
const base = `http://localhost:${PORT}`;
let server;
test.beforeAll(async () => { server = await start({ variant, log: false }); });
test.afterAll(async () => { await close(server); });

const runtimeId = (page) => page.evaluate(() => window.__runtimeId);

test.describe('observe', () => {
  test('an MPA link replaces the runtime', async ({ page }) => {
    await page.goto(`${base}/mpa/a`);
    const before = await runtimeId(page);
    await page.getByRole('link', { name: 'Go to page B' }).click();
    await page.waitForURL('**/mpa/b');
    expect(await runtimeId(page)).not.toBe(before);
  });

  test('a SPA navigation keeps the runtime and its in-memory state', async ({ page }) => {
    await page.goto(`${base}/spa/`);
    const before = await runtimeId(page);
    await page.getByRole('button', { name: /in-memory state/ }).click();
    await page.getByRole('link', { name: 'User 42' }).click();
    await expect(page.getByRole('heading', { name: '/spa/users/42' })).toBeVisible();
    expect(await runtimeId(page)).toBe(before);
    expect(await page.evaluate(() => window.__clicks)).toBe(1);
  });
});

test.describe('exercise', () => {
  test('swapping fragments does not leave timers running', async ({ page }) => {
    // Count live intervals from inside the page, independently of the lab's own counter.
    await page.addInitScript(() => {
      const live = new Set();
      const set = window.setInterval.bind(window), clear = window.clearInterval.bind(window);
      window.setInterval = (...a) => { const id = set(...a); live.add(id); return id; };
      window.clearInterval = (id) => { live.delete(id); clear(id); };
      window.__liveIntervals = () => live.size;
    });
    await page.goto(`${base}/swap/`);
    const baseline = await page.evaluate(() => window.__liveIntervals()); // the badge's own ticker
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Swap in a new fragment' }).click();
      await expect(page.locator('#slot [data-clock]')).toHaveCount(1);
    }
    await expect.poll(() => page.evaluate(() => window.__liveIntervals()), {
      message: 'each swap should tear down the previous fragment’s interval',
    }).toBe(baseline + 1);
  });
});
