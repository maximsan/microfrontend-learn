// Lab 06 — a router that does what the browser did for free.   node server.mjs [--solution]
import { serve, variant, listening } from '../_shared/serve.mjs';
import { isMain } from '../_shared/isMain.mjs';

export const PORT = 5106;

export function start({ variant: v = variant(), port = PORT, log = true } = {}) {
  const dirs = v === 'solution' ? ['./solution/', './starter/'] : ['./starter/'];
  if (log) console.log(`Lab 06 · router (${v})`);
  return listening(serve({ root: dirs.map((d) => new URL(d, import.meta.url)), port, log, fallbacks: { '/': '/index.html' } }));
}

if (isMain(import.meta.url)) start();
