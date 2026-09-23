// Serves the two builds on their own origins, as two teams would deploy them.
//   http://localhost:5110  shell (host)      http://localhost:5111  cart (remote)
// Stop the cart with `--no-cart` to see what the shell does when a remote is down.
// Build first: [VARIANT=solution] node build.mjs
import { serve, listening } from '../_shared/serve.mjs';
import { isMain } from '../_shared/isMain.mjs';
import { readVariant } from '../_shared/variant.mjs';

export const PORTS = { shell: 5110, cart: 5111 };

export async function start({ variant = readVariant('starter'), cart = true, log = true } = {}) {
  const dist = (app) => new URL(`./.build/${variant}/${app}/dist/`, import.meta.url);
  if (log) console.log(`Lab 10 · federation (${variant})`);
  const servers = [await listening(serve({ root: dist('shell'), port: PORTS.shell, log }))];
  if (cart) servers.push(await listening(serve({ root: dist('cart'), port: PORTS.cart, log, headers: { 'access-control-allow-origin': '*' } })));
  else if (log) console.log('cart remote is DOWN (--no-cart)');
  return servers;
}

if (isMain(import.meta.url)) start({ cart: !process.argv.includes('--no-cart') });
