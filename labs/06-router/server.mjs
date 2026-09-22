// Lab 06 — a router that does what the browser did for free.   node server.mjs [--solution]
import { serve, variant } from '../_shared/serve.mjs';

const v = variant();
const dirs = v === 'solution' ? ['./solution/', './starter/'] : ['./starter/'];
console.log(`Lab 06 · router (${v})`);
serve({ root: dirs.map((d) => new URL(d, import.meta.url)), port: 5106, fallbacks: { '/': '/index.html' } });
