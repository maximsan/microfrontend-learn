// YOUR BFF. The browser app in public/ still talks to the auth server and API
// directly. Implement these routes, then switch public/app.js over to them.
// `npm test` describes every requirement; run it after each step.
//
// Requirements (RFC 10017 §6.1, OWASP CSRF & Session Management cheat sheets):
//  1. GET  /bff/login     start Authorization Code + PKCE as the *confidential* client "bff"
//                         (secret "bff-secret", redirect http://localhost:5122/bff/callback).
//                         Keep state + code_verifier server-side, keyed by a short-lived
//                         login cookie (SameSite=Lax — the callback is a navigation from
//                         the auth server, and a Strict cookie is not sent on it cross-site).
//  2. GET  /bff/callback  verify state, exchange the code server-side, create a NEW session id
//                         (never reuse the pre-login id), set __Host-session:
//                         Secure; HttpOnly; SameSite=Strict; Path=/; no Domain.
//  3. GET  /bff/me        { user, csrfToken } for a live session, else 401. Never return tokens.
//  4. *    /bff/api/*     proxy to http://localhost:5121/api/* with the session's access token.
//                         Refresh it here when it expires — the BFF owns refresh.
//                         For POST/PUT/PATCH/DELETE require Origin === http://localhost:5122
//                         AND header x-csrf-token === the session's token, else 403.
//  5. POST /bff/logout    same CSRF checks; revoke the refresh token at /revoke, delete the
//                         server-side session, expire the cookie.
//  6. Sessions expire after IDLE_MS of inactivity and ABS_MS after creation, whichever first.
import { json } from '../lib.mjs';

export const IDLE_MS = Number(process.env.IDLE_MS ?? 15 * 60_000);
export const ABS_MS = Number(process.env.ABS_MS ?? 8 * 60 * 60_000);

const todo = (req, res) => json(res, 501, { error: 'not implemented yet' });

export const routes = {
  'GET /bff/login': todo,
  'GET /bff/callback': todo,
  'GET /bff/me': todo,
  '* /bff/api/*': todo,
  'POST /bff/logout': todo,
};
