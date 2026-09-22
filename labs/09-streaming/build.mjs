// Bundles the chosen variant for the server and the browser. solution/ files
// override starter/ files of the same name, so solutions contain only changes.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const layered = (variant) => ({
  name: 'layered',
  setup(b) {
    b.onResolve({ filter: /^\.\/[\w.-]+\.jsx?$/ }, (args) => {
      const name = args.path.slice(2);
      const sol = path.join(here, 'solution', name);
      if (variant === 'solution' && fs.existsSync(sol)) return { path: sol };
      return { path: path.join(here, 'starter', name) };
    });
  },
});

export async function build(variant) {
  const out = path.join(here, '.build', variant);
  const common = { bundle: true, jsx: 'automatic', format: 'esm', logLevel: 'warning', plugins: [layered(variant)] };
  await esbuild.build({ ...common, entryPoints: [path.join(here, 'starter/App.jsx')], platform: 'node', packages: 'external', outfile: path.join(out, 'app.mjs') });
  await esbuild.build({ ...common, entryPoints: [path.join(here, 'starter/client.jsx')], platform: 'browser', outfile: path.join(out, 'client.js'), define: { 'process.env.NODE_ENV': '"development"' } });
  return out;
}
