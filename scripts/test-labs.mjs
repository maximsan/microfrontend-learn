// Runs the test suite of every lab and the capstone that has one.
//   npm run test:labs            (labs needing dependencies are installed on first run)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dirs = [
  ...fs.readdirSync('labs').filter((d) => !d.startsWith('_')).map((d) => path.join('labs', d)),
  'capstone',
];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let failed = 0;
for (const dir of dirs) {
  const pkgFile = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgFile)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  if (!pkg.scripts?.test) continue;
  const needsInstall = (pkg.dependencies || pkg.devDependencies) && !fs.existsSync(path.join(dir, 'node_modules'));
  console.log(`\n── ${dir}`);
  try {
    if (needsInstall) execFileSync(npm, ['install', '--no-fund', '--no-audit'], { cwd: dir, stdio: 'inherit' });
    execFileSync(npm, ['test', '--silent'], { cwd: dir, stdio: 'inherit' });
  } catch {
    failed++;
  }
}
console.log(failed ? `\n✗ ${failed} suite(s) failed` : '\n✓ every lab and the capstone pass');
process.exit(failed ? 1 : 0);
