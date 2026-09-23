// The account zone (team Account): a SPA. The server's only job is to send the
// same document for every /account/* path and let the client router take over.
// Its data is personal, so it comes from the BFF at runtime and is never cached.
import http from 'node:http';
import fs from 'node:fs/promises';
import { PORTS, buildId, log, listen } from '../../lib.mjs';
import { head, header, footer } from '../../shell/header.mjs';

const BUILD = buildId('account');
const APP_JS = new URL('./public/app.js', import.meta.url);

export function createAccount() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://account');
    res.on('finish', () => log('account', req, res.statusCode));
    if (url.pathname === '/account/app.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache', 'x-build-id': BUILD });
      return res.end(await fs.readFile(APP_JS));
    }
    if (url.pathname === '/account' || url.pathname.startsWith('/account/')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-build-id': BUILD });
      return res.end(`<!doctype html><html lang="en"><head>${head({ title: 'Account', zone: 'account', build: BUILD })}
<script type="module" src="/account/app.js"></script></head><body>
${header({ zone: 'account' })}
<nav class="acme-main" aria-label="Account" style="padding-bottom:0">
  <a href="/account" data-route>Overview</a> · <a href="/account/orders" data-route>Orders</a> · <a href="/account/cart" data-route>Cart</a>
</nav>
<main id="main" class="acme-main"></main>
<p id="acme-announcer" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></p>
${footer()}
</body></html>`);
    }
    res.writeHead(404).end('Not found');
  });
}

export const start = () => listen(createAccount(), PORTS.account);
