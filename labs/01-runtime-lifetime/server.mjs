// Lab 01 — runtime lifetime.   node server.mjs [--solution]
import { serve, variant, listening } from '../_shared/serve.mjs';
import { isMain } from '../_shared/isMain.mjs';

export const PORT = 5101;

export function start({ variant: v = variant(), port = PORT, log = true } = {}) {
  const dirs = v === 'solution' ? ['./solution/', './starter/'] : ['./starter/'];
  if (log) console.log(`Lab 01 · runtime lifetime (${v})`);
  return listening(serve({
    root: dirs.map((d) => new URL(d, import.meta.url)),
    port,
    log,
    fallbacks: { '/spa/': '/spa/index.html' },
  }));
}

if (isMain(import.meta.url)) start();
