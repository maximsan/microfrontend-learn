// Starts all three services.   node start.mjs [--solution]
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startAuthServer } from './authserver.mjs';
import { startApi } from './api.mjs';
import { ORIGINS } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

export async function startAll({ variant = process.argv.includes('--solution') ? 'solution' : 'starter', log = true } = {}) {
  const { routes } = await import(`./${variant}/bff.mjs`);
  const app = http.createServer(async (req, res) => {
    const url = new URL(req.url, ORIGINS.app);
    const handler = Object.entries(routes).find(([k]) => {
      const [method, p] = k.split(' ');
      return (method === '*' || method === req.method) && (p.endsWith('*') ? url.pathname.startsWith(p.slice(0, -1)) : url.pathname === p);
    });
    if (handler) return handler[1](req, res, url);
    // solution/public overrides starter/public, so the solution holds only the files it changes.
    const name = url.pathname === '/' ? 'index.html' : url.pathname;
    let file = null, body = null;
    for (const dir of variant === 'solution' ? ['solution', 'starter'] : ['starter']) {
      file = path.join(here, dir, 'public', name);
      body = await fs.readFile(file).catch(() => null);
      if (body) break;
    }
    if (!body) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'text/plain' }).end(body);
  });
  const servers = [await startAuthServer(), await startApi(), await new Promise((r) => app.listen(5122, () => r(app)))];
  if (log) console.log(`Lab 13 · BFF (${variant})\n  app  ${ORIGINS.app}\n  api  ${ORIGINS.api}\n  auth ${ORIGINS.auth}`);
  return { close: () => Promise.all(servers.map((s) => new Promise((r) => { s.closeAllConnections?.(); s.close(r); }))) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) startAll();
