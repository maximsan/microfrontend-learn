// Builds cart (remote) and shell (host) for the chosen variant.
// solution/ files override starter/ files at the same path.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isMain } from '../_shared/isMain.mjs';
import { readVariant } from '../_shared/variant.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

export async function build(variant, { quiet = false } = {}) {
  // Imported here, not at the top: a broken native install then fails this lab's
  // tests only, instead of every test file that Playwright loads.
  const { rspack } = await import('@rspack/core');
  const work = path.join(here, '.build', variant);
  fs.rmSync(work, { recursive: true, force: true });
  copyTree(path.join(here, 'starter'), work);
  if (variant === 'solution') copyTree(path.join(here, 'solution'), work);

  const stats = {};
  for (const app of ['cart', 'shell']) {
    const dir = path.join(work, app);
    const { default: config } = await import(`${pathToFileURL(path.join(dir, 'rspack.config.mjs'))}?t=${Date.now()}`);
    const cfg = { ...config({ dist: path.join(dir, 'dist') }), context: dir };
    cfg.resolve = { ...cfg.resolve, modules: [path.join(here, 'node_modules'), 'node_modules'] };
    cfg.resolveLoader = { modules: [path.join(here, 'node_modules')] };
    const s = await new Promise((res, rej) => rspack(cfg, (err, st) => (err ? rej(err) : res(st))));
    if (s.hasErrors()) throw new Error(s.toString({ colors: false, all: false, errors: true }));
    stats[app] = s.toJson({ all: false, modules: true, chunks: true, chunkModules: true });
    if (!quiet) console.log(`built ${app} (${variant}) → ${path.relative(here, path.join(dir, 'dist'))}`);
  }
  return { work, stats };
}

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else fs.writeFileSync(b, fs.readFileSync(a));
  }
}

if (isMain(import.meta.url)) {
  await build(readVariant('starter'));
}
