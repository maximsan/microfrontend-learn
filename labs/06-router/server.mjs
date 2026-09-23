// Lab 06 — a router that does what the browser did for free.   [VARIANT=solution] node server.mjs
import { serve, listening } from '../_shared/serve.mjs';
import { isMain } from '../_shared/isMain.mjs';
import { readVariant, variantRoots } from '../_shared/variant.mjs';

export const PORT = 5106;

export function start({ variant = readVariant('starter'), port = PORT, log = true } = {}) {
  if (log) console.log(`Lab 06 · router (${variant})`);
  return listening(serve({ root: variantRoots(variant, import.meta.url), port, log, fallbacks: { '/': '/index.html' } }));
}

if (isMain(import.meta.url)) start();
