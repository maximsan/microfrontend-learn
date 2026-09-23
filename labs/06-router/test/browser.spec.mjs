// Lab 06 in a real browser: the four things a real navigation does for free.
//   npx playwright test labs/06-router          (LAB_VARIANT=starter to check your copy)
import { test, expect } from '@playwright/test';
import { start, PORT } from '../server.mjs';
import { close } from '../../_shared/serve.mjs';

const variant = process.env.LAB_VARIANT ?? 'solution';
const base = `http://localhost:${PORT}`;
let server;
test.beforeAll(async () => { server = await start({ variant, log: false }); });
test.afterAll(async () => { await close(server); });

/** Scroll down, then activate a nav link from the keyboard, as a keyboard user would. */
async function keyboardNavigate(page, href) {
  await page.evaluate((h) => {
    window.scrollTo(0, 900);
    document.querySelector(`nav a[href="${h}"]`).focus({ preventScroll: true });
  }, href);
  await page.keyboard.press('Enter');
  await page.waitForURL(`**${href}`);
}

test.beforeEach(async ({ page }) => {
  await page.goto(`${base}/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeVisible();
});

test.describe('exercise', () => {
  test('focus moves to the new view’s heading', async ({ page }) => {
    await keyboardNavigate(page, '/orders');
    await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeFocused();
  });

  test('the change is announced to screen readers', async ({ page }) => {
    await keyboardNavigate(page, '/orders');
    await expect(page.locator('#announcer')).toContainText('Orders');
  });

  test('the document title names the page', async ({ page }) => {
    await keyboardNavigate(page, '/orders/1042');
    await expect(page).toHaveTitle(/Order 1042/);
  });

  test('a new page starts at the top', async ({ page }) => {
    await keyboardNavigate(page, '/settings');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });

  test('Back is handled too: focus and title follow the traversal', async ({ page }) => {
    await keyboardNavigate(page, '/orders');
    await page.goBack();
    await page.waitForURL(`${base}/`);
    await expect(page).toHaveTitle(/Home/);
    await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeFocused();
  });
});
