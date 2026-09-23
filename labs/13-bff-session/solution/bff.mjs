// SOLUTION: a Backend for Frontend per RFC 10017 §6.1.
// The browser holds one HttpOnly cookie. Tokens never leave this process.
import { ORIGINS, random, s256, safeEqual, parseCookies, readForm, json, redirect } from '../lib.mjs';

const IDLE_MS = Number(process.env.IDLE_MS ?? 15 * 60_000);
const ABS_MS = Number(process.env.ABS_MS ?? 8 * 60 * 60_000);
const CLIENT = { id: 'bff', secret: 'bff-secret', redirect: `${ORIGINS.app}/bff/callback` };

const SESSION = '__Host-session';
const LOGIN = '__Host-login';
const cookie = (name, value, { sameSite = 'Strict', maxAge } = {}) =>
  `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=${sameSite}${maxAge !== undefined ? `; Max-Age=${maxAge}` : ''}`;

const logins = new Map();   // login id → { state, verifier, exp }
const sessions = new Map(); // session id → { user, tokens, csrf, created, seen }

/** The live session for this request, or null. Enforces idle and absolute timeouts. */
function session(req) {
  const id = parseCookies(req.headers.cookie)[SESSION];
  const s = id && sessions.get(id);
  if (!s) return null;
  const now = Date.now();
  if (now - s.seen > IDLE_MS || now - s.created > ABS_MS) {
    sessions.delete(id);
    return null;
  }
  s.seen = now;
  return { id, ...s, ref: s };
}

/** CSRF: same-origin Origin header AND the session's synchronizer token in a custom header. */
function csrfOk(req, s) {
  const origin = req.headers.origin ?? (req.headers.referer ? new URL(req.headers.referer).origin : null);
  if (origin !== ORIGINS.app) return false; // missing or foreign Origin → block (OWASP)
  return safeEqual(String(req.headers['x-csrf-token'] ?? ''), s.csrf);
}
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function tokenRequest(form) {
  const res = await fetch(`${ORIGINS.auth}/token`, {
    method: 'POST',
    body: new URLSearchParams({ client_id: CLIENT.id, client_secret: CLIENT.secret, ...form }),
  });
  return res.ok ? res.json() : null;
}

export const routes = {
  'GET /bff/login': (req, res) => {
    const id = random(), state = random(), verifier = random(32);
    logins.set(id, { state, verifier, exp: Date.now() + 5 * 60_000 });
    const q = new URLSearchParams({
      response_type: 'code', client_id: CLIENT.id, redirect_uri: CLIENT.redirect,
      state, code_challenge: s256(verifier), code_challenge_method: 'S256',
    });
    // Lax, not Strict: the callback is a top-level navigation *from the auth server*.
    redirect(res, `${ORIGINS.auth}/authorize?${q}`, { 'set-cookie': cookie(LOGIN, id, { sameSite: 'Lax', maxAge: 300 }) });
  },

  'GET /bff/callback': async (req, res, url) => {
    const loginId = parseCookies(req.headers.cookie)[LOGIN];
    const login = loginId && logins.get(loginId);
    logins.delete(loginId);
    if (!login || login.exp < Date.now() || !safeEqual(url.searchParams.get('state') ?? '', login.state)) {
      return json(res, 400, { error: 'invalid_state' });
    }
    const tokens = await tokenRequest({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: CLIENT.redirect, code_verifier: login.verifier });
    if (!tokens) return json(res, 400, { error: 'token_exchange_failed' });
    // A brand-new id: the pre-login cookie is never promoted (session fixation).
    const id = random();
    const now = Date.now();
    sessions.set(id, { user: 'max', tokens: { ...tokens, exp: now + tokens.expires_in * 1000 }, csrf: random(), created: now, seen: now });
    res.writeHead(302, { location: '/', 'set-cookie': [cookie(SESSION, id), cookie(LOGIN, '', { sameSite: 'Lax', maxAge: 0 })] });
    res.end();
  },

  'GET /bff/me': (req, res) => {
    const s = session(req);
    if (!s) return json(res, 401, { error: 'no_session' });
    json(res, 200, { user: s.user, csrfToken: s.csrf });
  },

  '* /bff/api/*': async (req, res, url) => {
    const s = session(req);
    if (!s) return json(res, 401, { error: 'no_session' });
    if (UNSAFE.has(req.method) && !csrfOk(req, s)) return json(res, 403, { error: 'csrf' });

    // The BFF owns refresh: one place, no race between micro-frontends.
    if (s.ref.tokens.exp - Date.now() < 5_000) {
      const t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: s.ref.tokens.refresh_token });
      if (!t) { sessions.delete(s.id); return json(res, 401, { error: 'refresh_failed' }); }
      s.ref.tokens = { ...t, exp: Date.now() + t.expires_in * 1000 };
    }
    const body = UNSAFE.has(req.method) ? JSON.stringify(await readForm(req)) : undefined;
    const upstream = await fetch(`${ORIGINS.api}${url.pathname.replace(/^\/bff/, '')}`, {
      method: req.method,
      headers: { authorization: `Bearer ${s.ref.tokens.access_token}`, 'content-type': 'application/json' },
      body,
    });
    json(res, upstream.status, await upstream.json());
  },

  'POST /bff/logout': async (req, res) => {
    const s = session(req);
    if (s) {
      if (!csrfOk(req, s)) return json(res, 403, { error: 'csrf' });
      // Server-side invalidation is the part that matters (OWASP).
      await fetch(`${ORIGINS.auth}/revoke`, { method: 'POST', body: new URLSearchParams({ token: s.ref.tokens.refresh_token }) });
      sessions.delete(s.id);
    }
    json(res, 200, { ok: true }, { 'set-cookie': cookie(SESSION, '', { maxAge: 0 }) });
  },
};
