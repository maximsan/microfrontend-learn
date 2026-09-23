// The requirements from starter/bff.mjs, as tests.   npm test   (VARIANT=starter npm test)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readVariant } from '../../_shared/variant.mjs';

process.env.IDLE_MS ??= '800';     // short timeouts so the expiry tests run fast
process.env.ABS_MS ??= '2500';
process.env.ACCESS_TTL_S ??= '2'; // access tokens near expiry on every call, so the BFF must refresh
const variant = readVariant();
const { startAll } = await import('../start.mjs');
const APP = 'http://localhost:5122';
let stack;
before(async () => { stack = await startAll({ variant, log: false }); });
after(() => stack.close());

/** A minimal browser: follows redirects by hand and keeps cookies per origin-less jar. */
function browser() {
  const jar = new Map();
  const cookies = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  async function go(url, init = {}) {
    for (let hops = 0; hops < 10; hops++) {
      const u = new URL(url);
      const headers = { ...init.headers };
      if (u.origin === APP && jar.size) headers.cookie = cookies();
      const res = await fetch(u, { ...init, headers, redirect: 'manual' });
      for (const c of res.headers.getSetCookie()) {
        const [pair, ...attrs] = c.split(/;\s*/);
        const [k, v] = [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)];
        (res.setCookies ??= []).push(c);
        if (attrs.some((a) => /^max-age=0$/i.test(a))) jar.delete(k); else jar.set(k, v);
      }
      if (res.status !== 302) return res;
      url = new URL(res.headers.get('location'), u).href;
      init = { headers: init.headers };
      (go.redirects ??= []).push(res);
    }
    throw new Error('too many redirects');
  }
  return { go, jar };
}

async function signIn() {
  const b = browser();
  const res = await b.go(`${APP}/bff/login`);
  assert.equal(res.status, 200, 'login flow should end on the app page');
  return b;
}
const csrfOf = async (b) => (await (await b.go(`${APP}/bff/me`)).json()).csrfToken;
const post = (b, path, headers = {}) => b.go(`${APP}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: '{"item":"Monitor"}' });

test('1–2 · login ends with a __Host- session cookie: Secure, HttpOnly, SameSite=Strict, Path=/, no Domain', async () => {
  const b = browser();
  const first = await fetch(`${APP}/bff/login`, { redirect: 'manual' });
  assert.equal(first.status, 302, '/bff/login should redirect to the authorization server');
  assert.match(first.headers.get('location'), /^http:\/\/localhost:5120\/authorize\?/);
  assert.match(first.headers.get('location'), /code_challenge_method=S256/);
  await b.go(`${APP}/bff/login`);
  const set = b.go.redirects.flatMap((r) => r.headers.getSetCookie()).find((c) => c.startsWith('__Host-session='));
  assert.ok(set, 'no __Host-session cookie was set');
  for (const attr of [/;\s*Secure/i, /;\s*HttpOnly/i, /;\s*SameSite=Strict/i, /;\s*Path=\//i]) assert.match(set, attr);
  assert.doesNotMatch(set, /Domain=/i, 'the session cookie must be host-only (RFC 10017: SHOULD NOT set Domain)');
});

test('2 · the session id is new at login — the pre-login cookie is never promoted', async () => {
  const b = browser();
  await b.go(`${APP}/bff/login`);
  const all = b.go.redirects.flatMap((r) => r.headers.getSetCookie()).map((c) => c.split(';')[0].split('=')[1]).filter(Boolean);
  assert.equal(new Set(all).size, all.length, 'a cookie value was reused across the login');
});

test('3 · /bff/me returns the user and a CSRF token, and never an OAuth token', async () => {
  const b = await signIn();
  const res = await b.go(`${APP}/bff/me`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /"csrfToken"/);
  assert.doesNotMatch(body, /access_token|refresh_token/i);
  assert.equal((await browser().go(`${APP}/bff/me`)).status, 401, 'no cookie, no session');
});

test('4 · reads go through the BFF with the token attached server-side', async () => {
  const b = await signIn();
  const res = await b.go(`${APP}/bff/api/orders`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(await res.json()));
});

test('4 · the BFF refreshes (and rotates) expiring access tokens itself', async () => {
  const b = await signIn();
  for (let i = 0; i < 3; i++) assert.equal((await b.go(`${APP}/bff/api/orders`)).status, 200, `call ${i + 1} failed — was the rotated refresh token kept?`);
});

test('4 · writes need both a same-origin Origin and the CSRF header', async () => {
  const b = await signIn();
  const token = await csrfOf(b);
  assert.equal((await post(b, '/bff/api/orders', { origin: APP })).status, 403, 'missing CSRF token must be rejected');
  assert.equal((await post(b, '/bff/api/orders', { origin: 'https://evil.example', 'x-csrf-token': token })).status, 403, 'foreign Origin must be rejected');
  assert.equal((await post(b, '/bff/api/orders', { 'x-csrf-token': token })).status, 403, 'missing Origin must be rejected');
  assert.equal((await post(b, '/bff/api/orders', { origin: APP, 'x-csrf-token': token })).status, 201);
});

test('5 · logout revokes the refresh token and destroys the session, so a captured cookie stops working', async () => {
  const { activeRefreshCount } = await import('../authserver.mjs');
  const b = await signIn();
  const captured = new Map(b.jar);
  const token = await csrfOf(b);
  const before = activeRefreshCount();
  assert.equal((await post(b, '/bff/logout', { origin: APP, 'x-csrf-token': token })).status, 200);
  assert.equal(activeRefreshCount(), before - 1, 'the refresh token is still active at the authorization server — the BFF could mint new access tokens after logout');
  const replay = browser();
  for (const [k, v] of captured) replay.jar.set(k, v);
  assert.equal((await replay.go(`${APP}/bff/api/orders`)).status, 401, 'the old cookie still works: logout only cleared it on the client');
});

test('6 · idle timeout: an untouched session expires', async () => {
  const b = await signIn();
  await new Promise((r) => setTimeout(r, Number(process.env.IDLE_MS) + 200));
  assert.equal((await b.go(`${APP}/bff/me`)).status, 401);
});

test('6 · absolute timeout: even an active session expires', async () => {
  const b = await signIn();
  const deadline = Date.now() + Number(process.env.ABS_MS) + 300;
  let last = 200;
  while (Date.now() < deadline) {           // keep it busy, well inside the idle window
    last = (await b.go(`${APP}/bff/me`)).status;
    await new Promise((r) => setTimeout(r, 300));
  }
  assert.equal(last, 401, 'the session outlived the absolute timeout by staying active');
});
