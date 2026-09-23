// Lab 01 — runtime lifetime.   [VARIANT=solution] node server.mjs
import { serve, listening } from '../_shared/serve.mjs';
import { isMain } from '../_shared/isMain.mjs';
import { readVariant, variantRoots } from '../_shared/variant.mjs';

export const PORT = 5101;

export function start({ variant = readVariant('starter'), port = PORT, log = true } = {}) {
  if (log) console.log(`Lab 01 · runtime lifetime (${variant})`);
  return listening(serve({
    root: variantRoots(variant, import.meta.url),
    port,
    log,
    fallbacks: { '/spa/': '/spa/index.html' },
  }));
}

if (isMain(import.meta.url)) start();
