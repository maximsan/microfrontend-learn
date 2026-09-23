// SOLUTION: the browser app talks only to its own origin. It holds no tokens;
// the BFF's HttpOnly cookie rides along automatically.
const $ = (id) => document.getElementById(id);
const show = (x) => { $('out').textContent = typeof x === 'string' ? x : JSON.stringify(x, null, 2); };
const tabs = new BroadcastChannel('acme:session');
let csrf = null;

async function me() {
  const res = await fetch('/bff/me');
  const data = res.ok ? await res.json() : null;
  csrf = data?.csrfToken ?? null;
  $('who').textContent = data ? `Signed in as ${data.user} (session cookie, HttpOnly).` : 'Not signed in.';
}

// State-changing calls carry the CSRF token in a custom header.
const send = (path, method, body) => fetch(path, {
  method, headers: { 'content-type': 'application/json', 'x-csrf-token': csrf ?? '' }, body: body && JSON.stringify(body),
});

$('login').onclick = () => { location.href = '/bff/login'; };
$('load').onclick = async () => show(await (await fetch('/bff/api/orders')).json());
$('create').onclick = async () => show(await (await send('/bff/api/orders', 'POST', { item: 'Monitor' })).json());
$('logout').onclick = async () => {
  await send('/bff/logout', 'POST');
  tabs.postMessage('session:ended');   // other tabs must not keep showing a signed-in UI
  show('Signed out: session destroyed on the server, refresh token revoked.');
  me();
};
tabs.onmessage = (e) => { if (e.data === 'session:ended') { show('Signed out in another tab.'); me(); } };

$('attack').onclick = async () => {
  const stolen = { localStorage: { ...localStorage }, cookie: document.cookie || '(empty — HttpOnly)' };
  // …but note what it *can* still do: ride the session from inside the origin (Appendix D).
  const res = await fetch('/bff/api/orders');
  $('loot').textContent = `${JSON.stringify(stolen, null, 2)}\n\nWhat it can still do: GET /bff/api/orders → ${res.status}`;
};

me();
