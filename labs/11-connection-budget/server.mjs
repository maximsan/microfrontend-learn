// Lab 11 — the six-connection budget.   node server.mjs [--solution]
// Plain HTTP/1.1 on purpose: browsers allow only six connections per host on it.
import { serve, variant, send } from '../_shared/serve.mjs';

const v = variant();
const dirs = v === 'solution' ? ['./solution/', './starter/'] : ['./starter/'];
const open = new Set();

function events(req, res, url) {
  const who = url.searchParams.get('who') ?? 'anonymous';
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
  const conn = { who };
  open.add(conn);
  console.log(`+ ${who.padEnd(14)} open streams: ${open.size}`);
  const tick = setInterval(() => {
    const msg = { type: 'tick', at: new Date().toISOString(), streams: open.size, holders: [...open].map((c) => c.who) };
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  }, 1000);
  req.on('close', () => { clearInterval(tick); open.delete(conn); console.log(`- ${who.padEnd(14)} open streams: ${open.size}`); });
}

console.log(`Lab 11 · connection budget (${v})`);
serve({
  root: dirs.map((d) => new URL(d, import.meta.url)),
  port: 5112,
  routes: {
    '/events': events,
    '/api/ping': (req, res) => send(res, 200, { pong: new Date().toISOString() }),
  },
});
