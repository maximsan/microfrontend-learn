// Capstone in a real browser: what the HTTP tests cannot see.
//   npx playwright test capstone                 the reference build
//   CAPSTONE_VARIANT=starter npx playwright test capstone   your build in capstone/starter/
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5200';
let stack;
test.beforeAll(async () => {
  process.env.QUIET = '1';
  const { startAll } = await import('../start.mjs');
  stack = await startAll();
});
test.afterAll(async () => { await stack.close(); });

// Count EventSources opened by each page, from inside the page.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const ES = window.EventSource;
    window.__streamsOpened = 0;
    window.EventSource = class extends ES { constructor(...a) { super(...a); window.__streamsOpened++; } };
  });
});

async function signIn(page) {
  await page.goto(`${BASE}/catalog`);
  await page.locator('[data-acme-session]').getByRole('link', { name: 'Sign in' }).click();
  await expect(page.locator('[data-acme-session]')).toContainText('Signed in as max');
}

test.describe('M1 · zones', () => {
  test('crossing into another zone is a full page load, and the session survives it', async ({ page }) => {
    await signIn(page);
    await page.evaluate(() => { window.__sameDocument = true; });
    await page.locator('.acme-header nav').getByRole('link', { name: 'Account' }).click();
    await page.waitForURL(`${BASE}/account`);
    expect(await page.evaluate(() => window.__sameDocument), 'a zone crossing must replace the document').toBeUndefined();
    await expect(page.locator('[data-acme-session]')).toContainText('Signed in as max');
  });

  test('inside the account zone, navigation is client-side and moves focus', async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE}/account`);
    await page.evaluate(() => { window.__sameDocument = true; });
    await page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeFocused();
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
    await expect(page.locator('main')).toContainText('#1042');
  });
});

test.describe('M2 · shared shell', () => {
  test('adding to the cart in the catalog updates the shell’s cart badge', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Add to cart' }).first().click();
    await expect(page.locator('[data-acme-cart]').first()).toHaveText(/^[1-9]\d*$/);
  });
});

test.describe('M3 · streaming with a budget', () => {
  test('recommendations arrive in their slot; a dead fragment shows a fallback', async ({ page }) => {
    await page.goto(`${BASE}/catalog`);
    await expect(page.locator('#recs-slot [data-recs]')).toBeVisible();
    await page.goto(`${BASE}/catalog?recs.fail=1`);
    await expect(page.locator('#recs-slot')).toContainText('unavailable');
    await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  });
});

test.describe('M6 · session', () => {
  test('signing out in one tab signs out the others', async ({ context }) => {
    const a = await context.newPage();
    await signIn(a);
    const b = await context.newPage();
    await b.goto(`${BASE}/account`);
    await expect(b.locator('[data-acme-session]')).toContainText('Signed in as max');
    await a.locator('[data-acme-session]').getByRole('button', { name: 'Sign out' }).click();
    await expect(b.locator('[data-acme-session]')).toContainText('Sign in');
  });

  test('no script on the page can read a token or the session cookie', async ({ page }) => {
    await signIn(page);
    const exposed = await page.evaluate(() => ({ cookie: document.cookie, storage: JSON.stringify({ ...localStorage, ...sessionStorage }) }));
    expect(exposed.cookie).not.toMatch(/__Host-acme/);
    expect(exposed.storage).not.toMatch(/token/i);
  });
});

test.describe('M7 · one realtime stream', () => {
  test('three tabs, one EventSource, live stock everywhere', async ({ context }) => {
    const tabs = [];
    for (let i = 0; i < 3; i++) { const p = await context.newPage(); await p.goto(`${BASE}/catalog`); tabs.push(p); }
    for (const t of tabs) await expect(t.locator('[data-stock="p1"]')).toHaveText(/^\d+$/, { timeout: 8_000 });
    const opened = await Promise.all(tabs.map((t) => t.evaluate(() => window.__streamsOpened)));
    expect(opened.reduce((a, b) => a + b, 0), `EventSources opened per tab: ${opened}`).toBe(1);
  });
});
