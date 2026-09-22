// Static checks on the build output: where does React come from?
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../build.mjs';

const variant = process.env.LAB_VARIANT ?? 'solution';
const { stats } = await build(variant, { quiet: true });

const consumed = (app) => stats[app].modules.filter((m) => m.moduleType === 'consume-shared-module').map((m) => m.name);

test('the cart consumes React from the share scope instead of bundling its own copy into the exposed widget', () => {
  const list = consumed('cart');
  assert.ok(list.some((n) => /shared module \(default\) react@/.test(n)), `cart does not consume react from the share scope, so CartWidget's hooks run against the cart's own React:\n${list.join('\n') || '(nothing consumed)'}`);
});

test("react-dom/client is shared, so the shell does not load a second React DOM", () => {
  const list = consumed('shell');
  assert.ok(list.some((n) => /react-dom\/client@/.test(n)), `shell bundles react-dom/client itself instead of sharing it. It consumes only:\n${list.join('\n')}`);
});
