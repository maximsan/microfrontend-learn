// Lab 09 — streaming SSR.   node server.mjs [--solution]
// The server runs in UTC on purpose, so its clock disagrees with yours (part 2).
process.env.TZ = 'UTC';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { build } from './build.mjs';

export async function start({ variant = process.argv.includes('--solution') ? 'solution' : 'starter', port = 5109, log = true } = {}) {
  const out = await build(variant);
  const { App } = await import(`${path.join(out, 'app.mjs')}?v=${Date.now()}`);
  const client = await fs.readFile(path.join(out, 'client.js'));
  const css = await fs.readFile(new URL('./starter/style.css', import.meta.url));

  const server = http.createServer((req, res) => {
    if (req.url === '/client.js') return res.writeHead(200, { 'content-type': 'text/javascript' }).end(client);
    if (req.url === '/style.css') return res.writeHead(200, { 'content-type': 'text/css' }).end(css);
    if (req.url === '/favicon.ico') return res.writeHead(404).end();

    const scope = new Map(); // per-request data cache: never share data across requests
    const stream = renderToPipeableStream(createElement(App, { scope }), {
      bootstrapModules: ['/client.js'],
      onShellReady() {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        stream.pipe(res);
      },
      onShellError(err) {
        res.writeHead(500, { 'content-type': 'text/plain' }).end(String(err));
      },
      onError(err) { console.error(err); },
    });
  });
  await new Promise((r) => server.listen(port, r));
  if (log) console.log(`Lab 09 · streaming (${variant}) → http://localhost:${server.address().port}/`);
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) start();
