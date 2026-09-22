// acme.shell@1 — the runtime half of the shared shell, served centrally at /shell/client.js.
// Every zone loads it. It owns exactly the cross-cutting concerns the book lists:
// session, CSRF token, realtime connection, cross-tab logout, and "what is running".
// Zones talk to it through window.acme — a deliberately tiny, versioned contract.
const CONTRACT = 'acme.shell@1';
const state = { user: undefined, csrf: null, cart: null, stock: {} };
const topics = new Map(); // topic → Set<fn>

function emit(topic, value) {
  for (const fn of topics.get(topic) ?? []) fn(value);
  window.dispatchEvent(new CustomEvent(`acme:${topic}`, { detail: value }));
}
/** Subscribe to 'user' | 'cart' | 'stock'. Called at once with the current value: events are not state. */
function on(topic, fn) {
  if (!topics.has(topic)) topics.set(topic, new Set());
  topics.get(topic).add(fn);
  const current = { user: state.user, cart: state.cart, stock: state.stock }[topic];
  if (current !== undefined && current !== null) fn(current);
  return () => topics.get(topic).delete(fn);
}

/* ---------- session ---------- */

const tabs = new BroadcastChannel('acme:session');

async function loadSession() {
  const res = await fetch('/bff/me', { credentials: 'same-origin' });
  const me = res.ok ? await res.json() : null;
  state.user = me?.user ?? null;
  state.csrf = me?.csrfToken ?? null;
  renderSession();
  emit('user', state.user ?? false);
  await refreshCart();
}

async function refreshCart() {
  if (!state.user) { state.cart = null; renderCart(); return; }
  const res = await fetch('/bff/api/cart');
  state.cart = res.ok ? await res.json() : null;
  renderCart();
  emit('cart', state.cart);
}

/** Fetch through the BFF; unsafe methods automatically carry the CSRF header. */
function api(path, init = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = { ...init.headers };
  if (method !== 'GET' && method !== 'HEAD') headers['x-csrf-token'] = state.csrf ?? '';
  if (init.body && typeof init.body !== 'string') { headers['content-type'] = 'application/json'; init = { ...init, body: JSON.stringify(init.body) }; }
  return fetch(`/bff/api${path}`, { ...init, method, headers });
}

async function logout() {
  await fetch('/bff/logout', { method: 'POST', headers: { 'x-csrf-token': state.csrf ?? '' } });
  tabs.postMessage('session:ended');
  await loadSession();
}
tabs.onmessage = () => loadSession(); // login or logout in another tab

function renderSession() {
  for (const el of document.querySelectorAll('[data-acme-session]')) {
    if (state.user) {
      el.innerHTML = `Signed in as <b></b> <button type="button">Sign out</button>`;
      el.querySelector('b').textContent = state.user;
      el.querySelector('button').onclick = logout;
    } else {
      const back = encodeURIComponent(location.pathname + location.search);
      el.innerHTML = `<a href="/bff/login?returnTo=${back}">Sign in</a>`;
    }
  }
}
function renderCart() {
  const n = state.cart?.items?.reduce((s, i) => s + i.qty, 0);
  for (const el of document.querySelectorAll('[data-acme-cart]')) el.textContent = n ?? '–';
}

/* ---------- realtime: one stream per browser ---------- */

const rt = new BroadcastChannel('acme:realtime');
function deliver(msg) {
  if (msg.type === 'stock') { state.stock = { ...state.stock, ...msg.levels }; emit('stock', state.stock); }
}
rt.onmessage = (e) => deliver(e.data);
navigator.locks?.request('acme:realtime-leader', () => {
  const es = new EventSource('/events');
  es.onmessage = (e) => { const msg = JSON.parse(e.data); deliver(msg); rt.postMessage(msg); };
  return new Promise(() => {});
});

/* ---------- what is running ---------- */

function renderVersions() {
  const rows = [...document.querySelectorAll('meta[name^="acme:build:"]')].map((m) => `${m.name.slice(11).padEnd(16)} ${m.content}`);
  rows.push(`${'shell-runtime'.padEnd(16)} ${CONTRACT}`);
  for (const el of document.querySelectorAll('[data-acme-versions]')) el.textContent = rows.join('\n');
}

window.acme = Object.freeze({
  contract: CONTRACT,
  on,
  api,
  refreshCart,
  getUser: () => state.user,
  getCsrfToken: () => state.csrf,
});

renderVersions();
loadSession();
