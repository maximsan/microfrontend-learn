// The gateway: the single origin the browser talks to.
//
//   /catalog…  → catalog zone        (server-rendered, streamed, CDN-cacheable)
//   /account…  → account zone        (a SPA)
//   /shell/…   → the runtime shell    (tokens.css, client.js — owned by the platform team)
//   /bff/…     → Backend for Frontend (cookie session, CSRF, token-free browser)
//   /events    → the realtime stream  (one per browser, thanks to the shell)
//
// It also mints the trace id every downstream call carries.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORTS, ORIGIN, INTERNAL_SECRET, random, safeEqual, parseCookies, readJson, json, log, listen, buildId } from '../lib.mjs';

const BUILD = buildId('gateway');
const SHELL_DIR = fileURLToPath(new URL('../shell/', import.meta.url));
const ZONES = [
  { prefix: '/catalog', port: PORTS.catalog },
  { prefix: '/account', port: PORTS.account },
];

/* ---------------- BFF: sessions ---------------- */

const IDLE_MS = Number(process.env.IDLE_MS ?? 15 * 60_000);
const ABS_MS = Number(process.env.ABS_MS ?? 8 * 60 * 60_000);
const COOKIE = '__Host-acme';
const sessions = new Map(); // id → { user, csrf, created, seen }

const setCookie = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict${maxAge !== undefined ? `; Max-Age=${maxAge}` : ''}`;

function currentSession(req) {
  const id = parseCookies(req.headers.cookie)[COOKIE];
  const s = id && sessions.get(id);
  if (!s) return null;
  const now = Date.now();
  if (now - s.seen > IDLE_MS || now - s.created > ABS_MS) { sessions.delete(id); return null; }
  s.seen = now;
  return { id, s };
}

function csrfOk(req, s) {
  const origin = req.headers.origin ?? (req.headers.referer ? new URL(req.headers.referer).origin : null);
  return origin === ORIGIN && safeEqual(String(req.headers['x-csrf-token'] ?? ''), s.csrf);
}
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Sign-in is stubbed: the OAuth half is lab 13's job. What matters here is what
// the browser ends up holding (one HttpOnly cookie) and what it never sees (tokens).
function login(req, res, url) {
  const returnTo = url.searchParams.get('returnTo') ?? '/catalog';
  const safeReturn = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/catalog';
  const id = random();                   // always a fresh id at login
  const now = Date.now();
  sessions.set(id, { user: url.searchParams.get('user') ?? 'max', csrf: random(), created: now, seen: now });
  res.writeHead(302, { location: safeReturn, 'set-cookie': setCookie(id), 'cache-control': 'no-store' });
  res.end();
}

async function bff(req, res, url) {
  if (url.pathname === '/bff/login' && req.method === 'GET') return login(req, res, url);
  const cur = currentSession(req);

  if (url.pathname === '/bff/me') {
    return cur ? json(res, 200, { user: cur.s.user, csrfToken: cur.s.csrf }) : json(res, 401, { error: 'no_session' });
  }
  if (url.pathname === '/bff/logout' && req.method === 'POST') {
    if (cur) {
      if (!csrfOk(req, cur.s)) return json(res, 403, { error: 'csrf' });
      sessions.delete(cur.id);
    }
    return json(res, 200, { ok: true }, { 'set-cookie': setCookie('', 0) });
  }
  if (url.pathname.startsWith('/bff/api/')) {
    if (!cur) return json(res, 401, { error: 'no_session' });
    if (UNSAFE.has(req.method) && !csrfOk(req, cur.s)) return json(res, 403, { error: 'csrf' });
    const body = UNSAFE.has(req.method) ? JSON.stringify(await readJson(req)) : undefined;
    const upstream = await fetch(`http://localhost:${PORTS.api}${url.pathname.slice(4)}${url.search}`, {
      method: req.method,
      body,
      headers: {
        'content-type': 'application/json',
        'x-trace-id': req.headers['x-trace-id'],
        // Identity travels server-to-server; the browser never holds a token.
        'x-internal-auth': INTERNAL_SECRET,
        'x-user': cur.s.user,
      },
    });
    return json(res, upstream.status, await upstream.json());
  }
  json(res, 404, { error: 'not_found' });
}

/* ---------------- realtime ---------------- */

const streams = new Set();
function events(req, res) {
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
  streams.add(res);
  req.on('close', () => streams.delete(res));
  res.write(`data: ${JSON.stringify(stockUpdate())}\n\n`);
}
const stockUpdate = () => ({ type: 'stock', levels: Object.fromEntries(['p1', 'p2', 'p3', 'p4'].map((p) => [p, Math.floor(Math.random() * 20)])) });
const ticker = setInterval(() => { for (const r of streams) r.write(`data: ${JSON.stringify(stockUpdate())}\n\n`); }, 2000);
ticker.unref();

/* ---------------- static runtime shell ---------------- */

async function shell(req, res, url) {
  const file = path.join(SHELL_DIR, path.basename(url.pathname));
  if (!/\.(css|js)$/.test(file)) return json(res, 404, { error: 'not_found' });
  const body = await fs.readFile(file).catch(() => null);
  if (!body) return json(res, 404, { error: 'not_found' });
  res.writeHead(200, {
    'content-type': file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8',
    'cache-control': 'public, max-age=60',
  });
  res.end(body);
}

/* ---------------- zones: routing-level composition ---------------- */

function proxy(req, res, port) {
  const up = http.request({ host: 'localhost', port, path: req.url, method: req.method, headers: req.headers }, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res); // stream through: the zone's flushes reach the browser as they happen
  });
  up.on('error', () => {
    if (!res.headersSent) json(res, 502, { error: 'zone_unavailable' });
    else res.end();
  });
  req.pipe(up);
}

function createGateway() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, ORIGIN);
    req.headers['x-trace-id'] ??= random(9);
    res.setHeader('x-trace-id', req.headers['x-trace-id']);
    res.setHeader('x-build-id', BUILD);
    res.on('finish', () => log('gateway', req, res.statusCode));
    try {
      if (url.pathname === '/') { res.writeHead(302, { location: '/catalog' }); return res.end(); }
      if (url.pathname.startsWith('/bff/')) return await bff(req, res, url);
      if (url.pathname === '/events') return events(req, res);
      if (url.pathname.startsWith('/shell/')) return await shell(req, res, url);
      const zone = ZONES.find((z) => url.pathname === z.prefix || url.pathname.startsWith(`${z.prefix}/`));
      if (zone) return proxy(req, res, zone.port);
      json(res, 404, { error: 'not_found' });
    } catch (err) {
      console.error(err);
      if (!res.headersSent) json(res, 500, { error: 'gateway_error' });
    }
  });
}

export const start = () => listen(createGateway(), PORTS.gateway);
