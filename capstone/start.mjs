// Starts the whole estate: five services, five processes' worth of ownership,
// one process here for convenience.   node start.mjs
import { fileURLToPath } from 'node:url';
import * as recommendations from './services/recommendations/server.mjs';
import * as api from './services/api/server.mjs';
import { ORIGIN } from './lib.mjs';

// The reference build lives here; your own build lives in starter/.
// Recommendations and the API are other teams' services and always run as-is.
export async function startAll({ skip = [], variant = process.env.CAPSTONE_VARIANT ?? 'solution' } = {}) {
  const dir = variant === 'starter' ? './starter' : '.';
  const [gateway, catalog, account] = await Promise.all([
    import(`${dir}/gateway/server.mjs`),
    import(`${dir}/zones/catalog/server.mjs`),
    import(`${dir}/zones/account/server.mjs`),
  ]);
  const all = { gateway, catalog, account, recommendations, api };
  const servers = [];
  for (const [name, mod] of Object.entries(all)) if (!skip.includes(name)) servers.push(await mod.start());
  return {
    close: () => Promise.all(servers.map((s) => new Promise((r) => { s.closeAllConnections?.(); s.close(r); }))),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const skip = process.argv.filter((a) => a.startsWith('--without=')).flatMap((a) => a.slice(10).split(','));
  await startAll({ skip });
  console.log(`Acme Shop (${process.env.CAPSTONE_VARIANT ?? 'solution'}) → ${ORIGIN}${skip.length ? `   (not running: ${skip.join(', ')})` : ''}`);
}
