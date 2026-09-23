// Small helpers shared by the mock services and the BFF. Zero dependencies.
import crypto from 'node:crypto';

export const ORIGINS = {
  auth: 'http://localhost:5120',   // authorization server
  api: 'http://localhost:5121',    // resource server
  app: 'http://localhost:5122',    // the browser-facing app (+ BFF in the solution)
};

export const random = (bytes = 24) => crypto.randomBytes(bytes).toString('base64url');
export const s256 = (verifier) => crypto.createHash('sha256').update(verifier).digest('base64url');
export const safeEqual = (a = '', b = '') =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(/;\s*/).filter(Boolean).map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
    }),
  );
}

export async function readForm(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const text = Buffer.concat(chunks).toString('utf8');
  if ((req.headers['content-type'] ?? '').includes('application/json')) return text ? JSON.parse(text) : {};
  return Object.fromEntries(new URLSearchParams(text));
}

export function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
}

export function redirect(res, location, headers = {}) {
  res.writeHead(302, { location, ...headers });
  res.end();
}
