// Runs the Node test suite of every lab and the capstone, in parallel.
//   npm run test:labs            (lab dependencies are installed for this machine first)
//
// Suites use their own ports, so they can run side by side. Output is buffered
// per suite and printed as each one finishes, so it stays readable.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { installLabs } from './install-labs.mjs';

const dirs = [
  ...fs.readdirSync('labs').filter((d) => !d.startsWith('_')).map((d) => path.join('labs', d)),
  'capstone',
];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

installLabs();

const suites = dirs.filter((dir) => {
  const pkgFile = path.join(dir, 'package.json');
  return fs.existsSync(pkgFile) && JSON.parse(fs.readFileSync(pkgFile, 'utf8')).scripts?.test;
});

const t0 = Date.now();
const results = await Promise.all(suites.map((dir) => new Promise((resolve) => {
  const started = Date.now();
  const child = spawn(npm, ['test', '--silent'], { cwd: dir, env: process.env });
  let out = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { out += d; });
  child.on('close', (code) => {
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`\n── ${dir} (${secs}s) ${code === 0 ? '✓' : '✗'}\n${out.trim()}`);
    resolve(code === 0);
  });
})));

const failed = results.filter((ok) => !ok).length;
const total = ((Date.now() - t0) / 1000).toFixed(1);
console.log(failed ? `\n✗ ${failed} suite(s) failed (${total}s)` : `\n✓ every lab and the capstone pass (${total}s)`);
process.exit(failed ? 1 : 0);
