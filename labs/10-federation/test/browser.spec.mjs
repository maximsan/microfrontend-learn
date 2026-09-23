// Lab 10 in a real browser: the widget renders with the shell's React, and a
// missing remote costs one widget, not the page.
//   npx playwright test labs/10-federation          (LAB_VARIANT=starter to check your copy)
import { test, expect } from '@playwright/test';
import { build } from '../build.mjs';
import { start, PORTS } from '../serve.mjs';
import { close } from '../../_shared/serve.mjs';

const variant = process.env.LAB_VARIANT ?? 'solution';
const shell = `http://localhost:${PORTS.shell}`;

test.beforeAll(async () => {
  test.setTimeout(120_000);
  await build(variant, { quiet: true });
});

test.describe('exercise', () => {
  test.describe('both teams deployed', () => {
    let servers;
    test.beforeAll(async () => { servers = await start({ variant, log: false }); });
    test.afterAll(async () => { await Promise.all(servers.map(close)); });

    test('the cart widget renders inside the shell, on the shell’s React', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(shell);
      await expect(page.getByRole('heading', { name: 'Acme shell' })).toBeVisible();
      await expect(page.getByText('shared with the shell')).toBeVisible();
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('1 item')).toBeVisible(); // the hook works
      expect(errors).toEqual([]);
    });
  });

  test.describe('the cart team is down', () => {
    let servers;
    test.beforeAll(async () => { servers = await start({ variant, cart: false, log: false }); });
    test.afterAll(async () => { await Promise.all(servers.map(close)); });

    test('the shell still renders, with a fallback where the widget was', async ({ page }) => {
      await page.goto(shell);
      await expect(page.getByRole('heading', { name: 'Acme shell' })).toBeVisible();
      await expect(page.getByText(/cart is unavailable/i)).toBeVisible();
    });
  });
});
