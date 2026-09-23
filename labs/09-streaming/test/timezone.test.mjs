import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../build.mjs';
import path from 'node:path';
import { readVariant } from '../../_shared/variant.mjs';

const variant = readVariant();

test('the first render of <Published> does not depend on the runtime time zone', async () => {
  const out = await build(variant);
  const { renderToString } = await import('react-dom/server');
  const { createElement } = await import('react');
  const render = async (tz) => {
    process.env.TZ = tz;
    const mod = await import(`${path.join(out, 'app.mjs')}?tz=${tz}`);
    // Render only the header by rendering the whole app and extracting <time>.
    const html = renderToString(createElement(mod.App, { scope: new Map() }));
    return html.match(/<time[^>]*>([\s\S]*?)<\/time>/)[1];
  };
  const utc = await render('UTC');
  const tokyo = await render('Asia/Tokyo');
  assert.equal(tokyo, utc, `server in UTC renders "${utc}", a browser in Tokyo renders "${tokyo}" — that is a hydration mismatch`);
});
