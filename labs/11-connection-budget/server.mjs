// Lab 11 — the six-connection budget.   [VARIANT=solution] node server.mjs
// Plain HTTP/1.1 on purpose: browsers allow only six connections per host on it.
import { serve, send, listening } from '../_shared/serve.mjs';
import { isMain } from '../_shared/isMain.mjs';
import { readVariant, variantRoots } from '../_shared/variant.mjs';

export const PORT = 5112;
const open = new Set();
let quiet = false;

/** Who holds a stream right now — the tests read this. */
export const streams = () => [...open].map((c) => c.who);

function events(req, res, url) {
  const who = url.searchParams.get('who') ?? 'anonymous';
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
  const conn = { who };
  open.add(conn);
  if (!quiet) console.log(`+ ${who.padEnd(14)} open streams: ${open.size}`);
  const tick = setInterval(() => {
    const msg = { type: 'tick', at: new Date().toISOString(), streams: open.size, holders: [...open].map((c) => c.who) };
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  }, 1000);
  req.on('close', () => { clearInterval(tick); open.delete(conn); if (!quiet) console.log(`- ${who.padEnd(14)} open streams: ${open.size}`); });
}

export function start({ variant = readVariant('starter'), port = PORT, log = true } = {}) {
  quiet = !log;
  if (log) console.log(`Lab 11 · connection budget (${variant})`);
  return listening(serve({
    root: variantRoots(variant, import.meta.url),
    port,
    log,
    routes: {
      '/events': events,
      '/api/ping': (req, res) => send(res, 200, { pong: new Date().toISOString() }),
    },
  }));
}

if (isMain(import.meta.url)) start();
