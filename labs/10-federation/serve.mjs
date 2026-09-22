// Serves the two builds on their own origins, as two teams would deploy them.
//   http://localhost:5110  shell (host)      http://localhost:5111  cart (remote)
// Stop the cart with `--no-cart` to see what the shell does when a remote is down.
import { serve } from '../_shared/serve.mjs';
import { pathToFileURL } from 'node:url';

const variant = process.argv.includes('--solution') ? 'solution' : 'starter';
const dist = (app) => new URL(`./.build/${variant}/${app}/dist/`, import.meta.url);
console.log(`Lab 10 · federation (${variant})`);
serve({ root: dist('shell'), port: 5110 });
if (!process.argv.includes('--no-cart')) {
  serve({ root: dist('cart'), port: 5111, headers: { 'access-control-allow-origin': '*' } });
} else {
  console.log('cart remote is DOWN (--no-cart)');
}
