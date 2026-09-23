// A deliberately tiny OAuth 2.0 authorization server — just enough for the lab.
// Authorization Code + PKCE, refresh-token rotation, revocation. It auto-approves
// user "max" instead of showing a login form. Not for production, obviously.
import http from 'node:http';
import { ORIGINS, random, s256, safeEqual, readForm, json, redirect } from './lib.mjs';

const CLIENTS = {
  spa: { public: true, redirect: `${ORIGINS.app}/callback.html` },
  bff: { public: false, secret: 'bff-secret', redirect: `${ORIGINS.app}/bff/callback` },
};
const ACCESS_TTL_S = Number(process.env.ACCESS_TTL_S ?? 60);

const codes = new Map();    // code → { client, challenge, user }
const access = new Map();   // token → { user, client, exp }
const refresh = new Map();  // token → { user, client, active }

export const isValidAccess = (token) => {
  const t = access.get(token);
  return t && t.exp > Date.now() ? t : null;
};
/** For the tests: how many refresh tokens could still mint an access token. */
export const activeRefreshCount = () => [...refresh.values()].filter((r) => r.active).length;

function issue(user, client) {
  const a = random(), r = random();
  access.set(a, { user, client, exp: Date.now() + ACCESS_TTL_S * 1000 });
  refresh.set(r, { user, client, active: true });
  return { access_token: a, token_type: 'Bearer', expires_in: ACCESS_TTL_S, refresh_token: r };
}

const cors = { 'access-control-allow-origin': ORIGINS.app, 'access-control-allow-headers': 'content-type' };

async function handle(req, res) {
  const url = new URL(req.url, ORIGINS.auth);
  if (req.method === 'OPTIONS') return res.writeHead(204, { ...cors, 'access-control-allow-methods': 'POST' }).end();

  if (url.pathname === '/authorize') {
    const p = url.searchParams;
    const client = CLIENTS[p.get('client_id')];
    if (!client || p.get('redirect_uri') !== client.redirect) return json(res, 400, { error: 'invalid_client' });
    if (p.get('code_challenge_method') !== 'S256' || !p.get('code_challenge')) return json(res, 400, { error: 'pkce_required' });
    const code = random();
    codes.set(code, { client: p.get('client_id'), challenge: p.get('code_challenge'), user: 'max' });
    const back = new URL(client.redirect);
    back.searchParams.set('code', code);
    back.searchParams.set('state', p.get('state') ?? '');
    return redirect(res, back.href);
  }

  if (url.pathname === '/token' && req.method === 'POST') {
    const f = await readForm(req);
    const client = CLIENTS[f.client_id];
    if (!client) return json(res, 401, { error: 'invalid_client' }, cors);
    if (!client.public && !safeEqual(f.client_secret, client.secret)) return json(res, 401, { error: 'invalid_client' }, cors);

    if (f.grant_type === 'authorization_code') {
      const c = codes.get(f.code);
      codes.delete(f.code); // single use
      if (!c || c.client !== f.client_id || s256(f.code_verifier ?? '') !== c.challenge) return json(res, 400, { error: 'invalid_grant' }, cors);
      return json(res, 200, issue(c.user, f.client_id), cors);
    }
    if (f.grant_type === 'refresh_token') {
      const r = refresh.get(f.refresh_token);
      if (!r?.active || r.client !== f.client_id) return json(res, 400, { error: 'invalid_grant' }, cors);
      r.active = false; // rotation: every refresh token works exactly once
      return json(res, 200, issue(r.user, f.client_id), cors);
    }
    return json(res, 400, { error: 'unsupported_grant_type' }, cors);
  }

  if (url.pathname === '/revoke' && req.method === 'POST') {
    const f = await readForm(req);
    const r = refresh.get(f.token);
    if (r) r.active = false;
    access.delete(f.token);
    return json(res, 200, {}, cors);
  }
  json(res, 404, { error: 'not_found' });
}

export const startAuthServer = (port = 5120) =>
  new Promise((r) => { const s = http.createServer(handle).listen(port, () => r(s)); });
