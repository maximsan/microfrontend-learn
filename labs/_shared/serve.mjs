// Tiny zero-dependency static server shared by the labs.
//
//   import { serve } from '../_shared/serve.mjs';
//   serve({ root: [solutionDir, starterDir], port: 5101, routes: { '/api/x': (req, res) => … } });
//
// - serves files from the first directory in `root` that has them, so a
//   solution folder only needs to contain the files it changes
// - "/foo/" → "/foo/index.html", "/foo" → "/foo.html"
// - `fallbacks` maps a path prefix to one file (client-side routing)
// - `routes` handlers run first and receive plain Node req/res
// - `headers` are added to every static response
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export function serve({ root, port, routes = {}, fallbacks = {}, headers = {}, log = true }) {
  const dirs = [root].flat().map((r) => fileURLToPath(r));
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      const handler = routes[`${req.method} ${url.pathname}`] ?? routes[url.pathname];
      if (handler) return await handler(req, res, url);

      let rel = decodeURIComponent(url.pathname);
      const fb = Object.keys(fallbacks).find((p) => rel.startsWith(p) && !path.extname(rel));
      if (fb) rel = fallbacks[fb];
      const found = await locate(dirs, rel);
      if (!found) return send(res, 404, 'Not found');
      res.writeHead(200, { 'content-type': TYPES[path.extname(found.file)] ?? 'application/octet-stream', ...headers });
      res.end(found.body);
    } catch (err) {
      console.error(err);
      send(res, 500, 'Server error');
    }
  });
  server.listen(port, () => log && console.log(`→ http://localhost:${port}/`));
  return server;
}

async function locate(dirs, rel) {
  for (const dir of dirs) {
    let file = path.join(dir, rel);
    if (!file.startsWith(dir)) return null;
    const stat = await fs.stat(file).catch(() => null);
    if (stat?.isDirectory()) file = path.join(file, 'index.html');
    else if (!stat && !path.extname(file)) file += '.html';
    const body = await fs.readFile(file).catch(() => null);
    if (body) return { file, body };
  }
  return null;
}

export function send(res, status, body, extra = {}) {
  const isJson = typeof body === 'object';
  res.writeHead(status, { 'content-type': isJson ? TYPES['.json'] : 'text/plain; charset=utf-8', ...extra });
  res.end(isJson ? JSON.stringify(body) : body);
}

export async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

/** Pick the starter or the solution from the command line: `node server.mjs --solution`. */
export const variant = () => (process.argv.includes('--solution') ? 'solution' : 'starter');
