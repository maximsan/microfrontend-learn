// Lab 01 — runtime lifetime.   node server.mjs [--solution]
import { serve, variant } from '../_shared/serve.mjs';

const v = variant();
const dirs = v === 'solution' ? ['./solution/', './starter/'] : ['./starter/'];
console.log(`Lab 01 · runtime lifetime (${v})`);
serve({
  root: dirs.map((d) => new URL(d, import.meta.url)),
  port: 5101,
  fallbacks: { '/spa/': '/spa/index.html' },
});
