// The catalog zone (team Catalog). Server-rendered and streamed:
//
//   1. flush the shell and the product grid at once — nothing waits for anyone
//   2. fetch the recommendations fragment from team Recommendations, with a budget
//   3. append it as a hidden block plus a tiny script that moves it into its slot,
//      or a fallback if it is slow or down — the technique React and Marko use,
//      written out by hand
//
// The HTML is identical for every visitor (personal bits are filled in by the
// shell in the browser), so it stays CDN-cacheable. That is the cacheability floor
// from the book, respected deliberately.
import http from 'node:http';
import { PORTS, buildId, escapeHtml, log, listen } from '../../lib.mjs';
import { head, header, footer } from '../../shell/header.mjs';

const BUILD = buildId('catalog');
const RECS_BUDGET_MS = Number(process.env.RECS_BUDGET_MS ?? 400);

export const PRODUCTS = [
  { id: 'p1', name: 'Mechanical keyboard', price: 129 },
  { id: 'p2', name: '27" monitor', price: 349 },
  { id: 'p3', name: 'USB-C dock', price: 89 },
  { id: 'p4', name: 'Desk lamp', price: 45 },
];

const card = (p) => `<article class="acme-card">
  <h2><a href="/catalog/${p.id}">${escapeHtml(p.name)}</a></h2>
  <p>€${p.price} · <span class="acme-muted">in stock: <b data-stock="${p.id}">…</b></span></p>
  <button class="acme-btn" data-add="${p.id}">Add to cart</button>
</article>`;

// Behaviour for the add buttons, using only the shell's public contract.
const pageScript = `<script type="module">
  document.addEventListener('click', async (e) => {
    const id = e.target.closest('[data-add]')?.dataset.add;
    if (!id) return;
    if (!window.acme.getUser()) { location.href = '/bff/login?returnTo=' + encodeURIComponent(location.pathname); return; }
    const res = await window.acme.api('/cart', { method: 'POST', body: { product: id } });
    e.target.textContent = res.ok ? 'Added ✓' : 'Could not add';
    window.acme.refreshCart();
  });
  window.acme.on('stock', (levels) => {
    for (const el of document.querySelectorAll('[data-stock]')) el.textContent = levels[el.dataset.stock] ?? '…';
  });
</script>`;

/** Fetch another team's fragment within a time budget. Never throws. */
async function fragment(req, url) {
  const q = new URLSearchParams();
  for (const k of ['delay', 'fail']) if (url.searchParams.has(`recs.${k}`)) q.set(k, url.searchParams.get(`recs.${k}`));
  try {
    const res = await fetch(`http://localhost:${PORTS.recommendations}/fragment?${q}`, {
      signal: AbortSignal.timeout(RECS_BUDGET_MS),
      // Context propagation, Podium-style: trace id and locale go to every fragment.
      headers: { 'x-trace-id': req.headers['x-trace-id'] ?? '', 'accept-language': req.headers['accept-language'] ?? 'en' },
    });
    if (!res.ok) return { ok: false, reason: `status ${res.status}` };
    return { ok: true, html: await res.text(), build: res.headers.get('x-build-id') };
  } catch (err) {
    return { ok: false, reason: err.name === 'TimeoutError' ? `over ${RECS_BUDGET_MS} ms budget` : 'unreachable' };
  }
}

async function catalogPage(req, res, url) {
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'public, max-age=60',   // identical for everyone → cacheable
    'x-build-id': BUILD,
  });
  // 1 · shell + grid, flushed immediately
  res.write(`<!doctype html><html lang="en"><head>${head({ title: 'Catalog', zone: 'catalog', build: BUILD })}</head><body>
${header({ zone: 'catalog' })}
<main id="main" class="acme-main">
  <h1>Catalog</h1>
  <div class="acme-grid">${PRODUCTS.map(card).join('')}</div>
  <section aria-labelledby="recs-h" style="margin-top:2rem">
    <h2 id="recs-h">You might also like</h2>
    <div id="recs-slot"><p class="acme-skeleton">Loading recommendations…</p></div>
  </section>
</main>
${footer()}
${pageScript}
`);

  // 2–3 · the fragment, out of order, into its slot
  const f = await fragment(req, url);
  if (f.ok) {
    res.write(`<meta name="acme:build:recommendations" content="${escapeHtml(f.build ?? 'unknown')}">
<div hidden id="recs-html">${f.html}</div>
<script>document.getElementById('recs-slot').replaceChildren(...document.getElementById('recs-html').childNodes);document.getElementById('recs-html').remove()</script>
`);
  } else {
    res.write(`<script>document.getElementById('recs-slot').innerHTML='<p class="acme-fallback">Recommendations are unavailable right now.</p>'</script>
<!-- recommendations fallback: ${escapeHtml(f.reason)} -->
`);
  }
  res.end('</body></html>');
}

function productPage(req, res, id) {
  const p = PRODUCTS.find((x) => x.id === id);
  res.writeHead(p ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60', 'x-build-id': BUILD });
  res.end(`<!doctype html><html lang="en"><head>${head({ title: p?.name ?? 'Not found', zone: 'catalog', build: BUILD })}</head><body>
${header({ zone: 'catalog' })}
<main id="main" class="acme-main">
  ${p ? `<h1>${escapeHtml(p.name)}</h1>${card(p)}` : '<h1>No such product</h1>'}
  <p><a href="/catalog">← All products</a> · <a href="/account/orders">Your orders</a> (another zone: a full page load)</p>
</main>
${footer()}
${pageScript}
</body></html>`);
}

export function createCatalog() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://catalog');
    res.on('finish', () => log('catalog', req, res.statusCode));
    if (url.pathname === '/catalog') return catalogPage(req, res, url);
    const m = url.pathname.match(/^\/catalog\/([\w-]+)$/);
    if (m) return productPage(req, res, m[1]);
    res.writeHead(404).end('Not found');
  });
}

export const start = () => listen(createCatalog(), PORTS.catalog);
