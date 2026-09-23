// The shared shell, build-time half: every zone renders this header on the server.
// It is a versioned package in the monorepo — zones upgrade it on their own schedule.
// The runtime half (client.js, tokens.css) is served centrally by the gateway.
import { escapeHtml } from '../lib.mjs';

export const SHELL_VERSION = 'shell@1.4.0';

/** <head> contents every zone needs: runtime tokens, the runtime shell, and its own build id. */
export function head({ title, zone, build }) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} · Acme</title>
<meta name="acme:build:${zone}" content="${escapeHtml(build)}">
<meta name="acme:build:shell-package" content="${SHELL_VERSION}">
<link rel="stylesheet" href="/shell/tokens.css">
<script type="module" src="/shell/client.js"></script>`;
}

/** Cross-zone links are plain <a> tags: moving between zones is a full navigation. */
export function header({ zone }) {
  const link = (href, label, z) => `<a href="${href}"${z === zone ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<a class="acme-skip" href="#main">Skip to content</a>
<header class="acme-header">
  <a class="acme-logo" href="/catalog">Acme</a>
  <nav aria-label="Main">${link('/catalog', 'Catalog', 'catalog')}${link('/account', 'Account', 'account')}</nav>
  <span class="acme-session" data-acme-session>…</span>
  <a class="acme-cart" href="/account/cart">Cart <b data-acme-cart>–</b></a>
</header>`;
}

export const footer = () => `<footer class="acme-footer"><details><summary>What is running</summary><pre data-acme-versions></pre></details></footer>`;
