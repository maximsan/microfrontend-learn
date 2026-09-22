// STARTER: a browser-based OAuth client (RFC 10017 pattern 3). The browser runs
// the whole flow and keeps every token — in localStorage, as far too many apps do.
const AUTH = 'http://localhost:5120', API = 'http://localhost:5121';
const $ = (id) => document.getElementById(id);
const show = (x) => { $('out').textContent = typeof x === 'string' ? x : JSON.stringify(x, null, 2); };

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = () => b64url(crypto.getRandomValues(new Uint8Array(32)));

$('login').onclick = async () => {
  const verifier = random();
  sessionStorage.setItem('pkce', verifier);
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const q = new URLSearchParams({ response_type: 'code', client_id: 'spa', redirect_uri: `${location.origin}/callback.html`, state: random(), code_challenge: challenge, code_challenge_method: 'S256' });
  location.href = `${AUTH}/authorize?${q}`;
};

const token = () => localStorage.getItem('access_token');
const api = (path, init = {}) => fetch(`${API}${path}`, { ...init, headers: { ...init.headers, authorization: `Bearer ${token()}` } });

$('load').onclick = async () => show(await (await api('/api/orders')).json());
$('create').onclick = async () => show(await (await api('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item: 'Monitor' }) })).json());
$('logout').onclick = () => { localStorage.clear(); show('Signed out (in this tab, on this client only).'); render(); };

// Any script on the origin can do this. That is the whole problem.
$('attack').onclick = () => {
  $('loot').textContent = `localStorage: ${JSON.stringify({ ...localStorage }, null, 2)}\ndocument.cookie: ${document.cookie || '(empty)'}`;
};

function render() { $('who').textContent = token() ? 'Signed in (token in localStorage).' : 'Not signed in.'; }
render();
