// Helpers shared by every Acme service. Zero dependencies.
import crypto from 'node:crypto';

export const PORTS = { gateway: 5200, catalog: 5201, account: 5202, recommendations: 5203, api: 5204 };
export const ORIGIN = `http://localhost:${PORTS.gateway}`;          // the only origin the browser sees
export const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? 'dev-only-internal-secret';

export const random = (n = 18) => crypto.randomBytes(n).toString('base64url');
export const safeEqual = (a = '', b = '') =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Every service publishes a build id; set BUILD_<NAME> to simulate a deploy. */
export const buildId = (name) => process.env[`BUILD_${name.toUpperCase()}`] ?? `${name}@1.0.0+dev`;

export function parseCookies(header = '') {
  return Object.fromEntries(header.split(/;\s*/).filter(Boolean).map((p) => {
    const i = p.indexOf('=');
    return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
  }));
}

export async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const t = Buffer.concat(chunks).toString('utf8');
  return t ? JSON.parse(t) : {};
}

export function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
}

export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** One log line per request, always with the trace id: the first thing you need in an incident. */
export function log(service, req, status) {
  if (process.env.QUIET) return;
  console.log(`${(req.headers['x-trace-id'] ?? '-').padEnd(24)} ${service.padEnd(16)} ${req.method} ${req.url} → ${status}`);
}

export const listen = (server, port) => new Promise((r) => server.listen(port, () => r(server)));
