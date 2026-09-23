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

// Only M6 tests sign in. Everything before M6 must go green without a BFF,
// so a milestone's tests never wait on work from a later milestone.
async function signIn(page) {
  await page.goto(`${BASE}/catalog`);
  await page.locator('[data-acme-session]').getByRole('link', { name: 'Sign in' }).click();
  await expect(page.locator('[data-acme-session]')).toContainText('Signed in as max');
}

/** Mark the current document; after a full page load the mark is gone. */
const markDocument = (page) => page.evaluate(() => { window.__sameDocument = true; });
const sameDocument = (page) => page.evaluate(() => window.__sameDocument === true);

test.describe('M1 · zones', () => {
  test('crossing into another zone is a full page load, in both directions', async ({ page }) => {
    // The links the M1 acceptance tests require: /catalog/p1 → /account/orders, /account → /catalog.
    await page.goto(`${BASE}/catalog/p1`);
    await markDocument(page);
    await page.locator('a[href="/account/orders"]').first().click();
    await page.waitForURL(`${BASE}/account/orders`);
    expect(await sameDocument(page), 'catalog → account must replace the document').toBe(false);

    await markDocument(page);
    await page.getByRole('link', { name: 'Catalog', exact: true }).first().click();
    await page.waitForURL(`${BASE}/catalog`);
    expect(await sameDocument(page), 'the account router must leave links into another zone to the browser').toBe(false);
  });

  test('inside the account zone, navigation is client-side and moves focus', async ({ page }) => {
    // Start and end on views that need no data (an unknown route, then Overview),
    // so this passes with the zone and its router alone: no shell, no BFF.
    await page.goto(`${BASE}/account/no-such-page`);
    await markDocument(page);
    await page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Overview' }).click();
    await expect(page).toHaveURL(`${BASE}/account`);
    await expect(page.getByRole('heading', { level: 1, name: 'Account', exact: true })).toBeFocused();
    expect(await sameDocument(page), 'a route inside the zone must not reload the page').toBe(true);
  });
});

test.describe('M2 · shared shell', () => {
  test('both zones apply the runtime tokens and run the runtime shell served by the gateway', async ({ page }) => {
    // The HTTP tests see the <link> and <script> tags; only a browser sees them take effect
    // (wrong MIME type, wrong path, a module that throws).
    const brand = {};
    for (const path of ['/catalog', '/account']) {
      await page.goto(`${BASE}${path}`);
      await expect(page.locator('.acme-header')).toBeVisible();
      await expect.poll(() => page.evaluate(() => typeof window.acme?.on), { message: `window.acme on ${path}` }).toBe('function');
      brand[path] = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acme-brand').trim());
      expect(brand[path], `--acme-brand is not applied on ${path}`).not.toBe('');
    }
    expect(brand['/account'], 'both zones read the same tokens').toBe(brand['/catalog']);
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
  test('the session survives a zone crossing, and the account zone shows your orders', async ({ page }) => {
    await signIn(page);
    await page.locator('.acme-header nav').getByRole('link', { name: 'Account' }).click();
    await page.waitForURL(`${BASE}/account`);
    await expect(page.locator('[data-acme-session]')).toContainText('Signed in as max');
    await page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Orders' }).click();
    await expect(page.locator('main')).toContainText('#1042');
  });

  test('adding to the cart in the catalog updates the shell’s cart badge', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Add to cart' }).first().click();
    await expect(page.locator('[data-acme-cart]').first()).toHaveText(/^[1-9]\d*$/);
  });

  test('a slow view does not paint over the page the reader has moved to', async ({ page }) => {
    await signIn(page);
    await page.route('**/bff/api/orders', async (route) => { await new Promise((r) => setTimeout(r, 1_000)); await route.continue(); });
    const ordersRequested = page.waitForRequest('**/bff/api/orders');
    const ordersAnswered = page.waitForResponse('**/bff/api/orders');
    await page.goto(`${BASE}/account/orders`);
    await ordersRequested; // the Orders view is now waiting for its data
    await page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Overview' }).click();
    const heading = page.getByRole('heading', { level: 1, name: 'Account', exact: true });
    await expect(heading).toBeFocused();
    await ordersAnswered;
    await page.waitForTimeout(300); // let the late Orders render finish, if it is going to paint
    await expect(heading, 'the late Orders view replaced the page the reader navigated to').toBeVisible();
    await expect(page.locator('main')).not.toContainText('#1042');
  });

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
