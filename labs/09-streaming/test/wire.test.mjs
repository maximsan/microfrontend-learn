import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { start } from '../server.mjs';
import { readVariant } from '../../_shared/variant.mjs';

const variant = readVariant();
const server = await start({ variant, port: 0, log: false });
after(() => server.close());
const base = `http://localhost:${server.address().port}`;

async function chunks() {
  const t0 = performance.now();
  const res = await fetch(`${base}/`);
  const dec = new TextDecoder();
  const list = [];
  for await (const c of res.body) list.push({ at: performance.now() - t0, text: dec.decode(c, { stream: true }) });
  return list;
}

test('the shell arrives before any data has resolved', async () => {
  const list = await chunks();
  const first = list[0];
  assert.match(first.text, /Loading post…/);
  assert.match(first.text, /Loading sidebar…/);
  assert.ok(first.at < 300, `shell took ${Math.round(first.at)} ms`);
});

test('boundaries arrive in order of completion, not order of markup', async () => {
  const list = await chunks();
  const idx = (re) => list.findIndex((c) => re.test(c.text));
  const sidebar = idx(/Islands vs micro-frontends/);
  const post = idx(/Out-of-order streaming/);
  assert.ok(sidebar > 0 && post > 0, 'both boundaries streamed after the shell');
  assert.ok(sidebar < post, 'the sidebar (later in markup) arrived before the post');
});

test('each late boundary is a hidden block plus a script that moves it into place', async () => {
  const late = (await chunks()).slice(1).map((c) => c.text).join('');
  assert.match(late, /<div hidden id="S:\d+">/);
  assert.match(late, /\$RC\(/);
});
