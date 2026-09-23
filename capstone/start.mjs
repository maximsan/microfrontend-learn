// Starts the whole estate: five services, five processes' worth of ownership,
// one process here for convenience.   node start.mjs
import * as recommendations from './services/recommendations/server.mjs';
import * as api from './services/api/server.mjs';
import { ORIGIN } from './lib.mjs';
import { isMain } from '../labs/_shared/isMain.mjs';
import { readVariant } from '../labs/_shared/variant.mjs';

// The reference build lives here; your own build lives in starter/.
// Recommendations and the API are other teams' services and always run as-is.
export async function startAll({ skip = [], variant = readVariant() } = {}) {
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

if (isMain(import.meta.url)) {
  const skip = process.argv.filter((a) => a.startsWith('--without=')).flatMap((a) => a.slice(10).split(','));
  const variant = readVariant();
  await startAll({ skip, variant });
  console.log(`Acme Shop (${variant}) → ${ORIGIN}${skip.length ? `   (not running: ${skip.join(', ')})` : ''}`);
}
