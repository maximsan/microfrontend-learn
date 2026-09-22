// Acceptance tests for the capstone. They talk only to the gateway, over HTTP,
// so they can run against the reference build or against your own:
//
//   npm test                                   start the reference estate and test it
//   CAPSTONE_URL=http://localhost:5200 npm test   test an estate you started yourself
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.QUIET = '1';
process.env.IDLE_MS ??= '1500';
const BASE = process.env.CAPSTONE_URL ?? 'http://localhost:5200';
let stack = null;
before(async () => {
  if (!process.env.CAPSTONE_URL) stack = await (await import('../start.mjs')).startAll();
});
after(() => stack?.close());

/** Minimal browser: a cookie jar and manual redirects. */
function browser() {
  const jar = new Map();
  async function go(path, init = {}) {
    let url = new URL(path, BASE).href;
    for (let hops = 0; hops < 5; hops++) {
      const headers = { ...init.headers };
      if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
      const res = await fetch(url, { ...init, headers, redirect: 'manual' });
      res.cookies = res.headers.getSetCookie();
      for (const c of res.cookies) {
        const [pair] = c.split(';');
        const k = pair.slice(0, pair.indexOf('=')), v = pair.slice(pair.indexOf('=') + 1);
        if (/max-age=0/i.test(c)) jar.delete(k); else jar.set(k, v);
      }
      if (res.status !== 302 || init.noFollow) return res;
      url = new URL(res.headers.get('location'), url).href;
      init = { headers: init.headers };
    }
    throw new Error('redirect loop');
  }
  return { go, jar };
}
async function signedIn() {
  const b = browser();
  await b.go('/bff/login?returnTo=/account');
  const me = await (await b.go('/bff/me')).json();
  return { b, csrf: me.csrfToken };
}
const post = (b, path, body, headers = {}) =>
  b.go(path, { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE, ...headers }, body: JSON.stringify(body ?? {}) });

describe('M1 · routing-level zones behind one origin', () => {
  test('/ redirects to the catalog zone', async () => {
    const res = await fetch(`${BASE}/`, { redirect: 'manual' });
    assert.equal(res.status, 302);
    assert.equal(new URL(res.headers.get('location'), BASE).pathname, '/catalog');
  });
  test('each zone is its own deployable with its own build id', async () => {
    const cat = await fetch(`${BASE}/catalog`);
    const acc = await fetch(`${BASE}/account/orders`);
    assert.match(cat.headers.get('x-build-id') ?? '', /^catalog@/);
    assert.match(acc.headers.get('x-build-id') ?? '', /^account@/);
    await cat.text(); await acc.text();
  });
  test('links between zones are plain <a> tags, not client-routed', async () => {
    const html = await (await fetch(`${BASE}/catalog/p1`)).text();
    assert.match(html, /<a href="\/account\/orders">/);
    const acc = await (await fetch(`${BASE}/account`)).text();
    assert.match(acc, /<a href="\/catalog"[^>]*>Catalog<\/a>/);
    assert.doesNotMatch(acc, /<a href="\/catalog"[^>]*data-route/, 'the account router must not intercept links into another zone');
  });
});

describe('M2 · the shared shell', () => {
  test('both zones render the same header and load the runtime shell and tokens from the gateway', async () => {
    for (const path of ['/catalog', '/account']) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      assert.match(html, /class="acme-header"/, `${path} lacks the shared header`);
      assert.match(html, /src="\/shell\/client\.js"/);
      assert.match(html, /href="\/shell\/tokens\.css"/);
    }
  });
  test('design tokens are CSS custom properties, prefixed per the house rule', async () => {
    const css = await (await fetch(`${BASE}/shell/tokens.css`)).text();
    assert.match(css, /--acme-brand:/);
    assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /--(?!acme-)[\w-]+:/, 'every custom property should be --acme- prefixed');
  });
});

describe('M3 · fragment streaming with a budget', () => {
  const read = async (path) => {
    const t0 = performance.now();
    const res = await fetch(`${BASE}${path}`);
    const dec = new TextDecoder();
    const chunks = [];
    for await (const c of res.body) chunks.push({ at: performance.now() - t0, text: dec.decode(c, { stream: true }) });
    return { res, chunks, html: chunks.map((c) => c.text).join(''), total: performance.now() - t0 };
  };
  test('the shell and product grid flush before the fragment arrives', async () => {
    const { chunks } = await read('/catalog?recs.delay=300');
    assert.match(chunks[0].text, /Loading recommendations…/);
    assert.match(chunks[0].text, /Mechanical keyboard/);
    assert.ok(chunks.length >= 2, 'the page arrived as one chunk — nothing was streamed');
  });
  test('a fast fragment is moved into its slot by an inline script', async () => {
    const { html } = await read('/catalog?recs.delay=50');
    assert.match(html, /<div hidden id="recs-html">/);
    assert.match(html, /data-recs/);
  });
  test('a slow fragment is abandoned at the budget and replaced by a fallback', async () => {
    const { html, total } = await read('/catalog?recs.delay=3000');
    assert.match(html, /Recommendations are unavailable/);
    assert.ok(total < 1500, `the page waited ${Math.round(total)} ms for a slow team`);
  });
  test('a failing fragment degrades the same way', async () => {
    const { html } = await read('/catalog?recs.fail=1');
    assert.match(html, /Recommendations are unavailable/);
  });
});

describe('M4 · context propagation and knowing what is running', () => {
  test('the trace id minted at the gateway reaches the fragment service', async () => {
    const res = await fetch(`${BASE}/catalog?recs.delay=10`);
    const trace = res.headers.get('x-trace-id');
    assert.ok(trace, 'the gateway sets x-trace-id');
    assert.match(await res.text(), new RegExp(`data-trace="${trace}"`));
  });
  test('an incoming trace id is honoured, not replaced', async () => {
    const res = await fetch(`${BASE}/catalog?recs.delay=10`, { headers: { 'x-trace-id': 'incident-4711' } });
    assert.equal(res.headers.get('x-trace-id'), 'incident-4711');
    assert.match(await res.text(), /data-trace="incident-4711"/);
  });
  test('the locale travels with the request, so the fragment renders in the user’s language', async () => {
    const html = await (await fetch(`${BASE}/catalog?recs.delay=10`, { headers: { 'accept-language': 'de-DE' } })).text();
    assert.match(html, /data-locale="de"/);
    assert.match(html, /Kabelorganizer/);
  });
  test('the page publishes the build id of every part it was assembled from', async () => {
    const html = await (await fetch(`${BASE}/catalog?recs.delay=10`)).text();
    for (const part of ['catalog', 'shell-package', 'recommendations']) assert.match(html, new RegExp(`meta name="acme:build:${part}"`));
  });
});

describe('M5 · the cacheability floor', () => {
  test('the catalog stays CDN-cacheable and identical for a signed-in user', async () => {
    const anon = await (await fetch(`${BASE}/catalog?recs.delay=10`)).text();
    const { b } = await signedIn();
    const res = await b.go('/catalog?recs.delay=10');
    assert.match(res.headers.get('cache-control') ?? '', /public/);
    const mine = await res.text();
    assert.doesNotMatch(mine, /\bmax\b/, 'user data leaked into a cacheable document');
    const strip = (s) => s.replace(/data-trace="[^"]*"/g, '');
    assert.equal(strip(mine), strip(anon), 'the signed-in HTML differs from the anonymous one');
  });
});

describe('M6 · BFF session', () => {
  test('sign-in sets one __Host- cookie: Secure, HttpOnly, SameSite=Strict, Path=/, no Domain', async () => {
    const res = await browser().go('/bff/login', { noFollow: true });
    const c = res.cookies.find((x) => x.startsWith('__Host-'));
    assert.ok(c, 'no __Host- cookie');
    for (const a of [/Secure/i, /HttpOnly/i, /SameSite=Strict/i, /Path=\//i]) assert.match(c, a);
    assert.doesNotMatch(c, /Domain=/i);
  });
  test('/bff/me never exposes tokens', async () => {
    const { b } = await signedIn();
    const body = await (await b.go('/bff/me')).json();
    assert.deepEqual(Object.keys(body).sort(), ['csrfToken', 'user'], 'the browser needs a user and a CSRF token — nothing else');
  });
  test('writes need the CSRF header and a same-origin Origin', async () => {
    const { b, csrf } = await signedIn();
    assert.equal((await post(b, '/bff/api/cart', { product: 'p1' })).status, 403);
    assert.equal((await post(b, '/bff/api/cart', { product: 'p1' }, { 'x-csrf-token': csrf, origin: 'https://evil.example' })).status, 403);
    assert.equal((await post(b, '/bff/api/cart', { product: 'p1' }, { 'x-csrf-token': csrf })).status, 201);
  });
  test('users only ever see their own cart (enforced at the API, not in the browser)', async () => {
    const alice = browser(); await alice.go('/bff/login?user=alice');
    const aCsrf = (await (await alice.go('/bff/me')).json()).csrfToken;
    await post(alice, '/bff/api/cart', { product: 'p3' }, { 'x-csrf-token': aCsrf });
    const bob = browser(); await bob.go('/bff/login?user=bob');
    const cart = await (await bob.go('/bff/api/cart')).json();
    assert.deepEqual(cart.items, []);
  });
  test('logout destroys the session on the server; a captured cookie is dead', async () => {
    const { b, csrf } = await signedIn();
    const captured = new Map(b.jar);
    assert.equal((await post(b, '/bff/logout', {}, { 'x-csrf-token': csrf })).status, 200);
    const thief = browser();
    for (const [k, v] of captured) thief.jar.set(k, v);
    assert.equal((await thief.go('/bff/api/cart')).status, 401);
  });
  test('an idle session expires', async () => {
    const { b } = await signedIn();
    await new Promise((r) => setTimeout(r, Number(process.env.IDLE_MS) + 300));
    assert.equal((await b.go('/bff/me')).status, 401);
  });
});

describe('M7 · one realtime stream', () => {
  test('/events is a server-sent event stream the shell can share', async () => {
    const ctrl = new AbortController();
    const res = await fetch(`${BASE}/events`, { signal: ctrl.signal });
    assert.match(res.headers.get('content-type') ?? '', /text\/event-stream/);
    const reader = res.body.getReader();
    const { value } = await reader.read();
    ctrl.abort();
    assert.match(new TextDecoder().decode(value), /^data: \{"type":"stock"/);
  });
  test('the runtime shell elects one leader tab for the stream', async () => {
    const js = await (await fetch(`${BASE}/shell/client.js`)).text();
    assert.match(js, /navigator\.locks/);
    assert.match(js, /BroadcastChannel/);
  });
});
