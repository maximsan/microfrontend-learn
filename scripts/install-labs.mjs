// Makes sure every lab with dependencies is installed *for this machine*.
//
// Some packages ship a native binary per platform (Rspack, esbuild). A
// node_modules folder installed on another OS or CPU has the wrong one, and
// fails with "Cannot find native binding". Each install is stamped with the
// platform it was made for; a missing or different stamp means reinstall.
//
//   node scripts/install-labs.mjs     (run automatically by the test scripts)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isMain } from '../labs/_shared/isMain.mjs';

const here = `${process.platform}-${process.arch}`;
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const dirs = [
  ...fs.readdirSync('labs').filter((d) => !d.startsWith('_')).map((d) => path.join('labs', d)),
  'capstone',
];

export function installLabs({ quiet = false } = {}) {
  for (const dir of dirs) {
    const pkgFile = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgFile)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    if (!pkg.dependencies && !pkg.devDependencies) continue;
    const modules = path.join(dir, 'node_modules');
    const stamp = path.join(modules, '.installed-for');
    const current = fs.existsSync(stamp) ? fs.readFileSync(stamp, 'utf8').trim() : null;
    if (current === here) continue;
    if (!quiet) console.log(`── ${dir}: installing for ${here}${fs.existsSync(modules) ? ` (found ${current ?? 'an unstamped install'})` : ''}`);
    fs.rmSync(modules, { recursive: true, force: true });
    execFileSync(npm, ['install', '--no-fund', '--no-audit'], { cwd: dir, stdio: quiet ? 'ignore' : 'inherit' });
    fs.writeFileSync(stamp, `${here}\n`);
  }
}

if (isMain(import.meta.url)) installLabs();
