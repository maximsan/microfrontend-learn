// Quality gate for the book: build, then check the output.
//   npm run check
// - every in-page link (#id) points at an element that exists
// - no duplicate ids
// - every other link is absolute http(s) (the page is a single file)
// - no chapter is missing its recap or self-check (orientation and appendices excepted)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

execFileSync(process.execPath, [...process.execArgv, 'scripts/build.mjs'], { stdio: 'inherit' });
const html = fs.readFileSync('dist/index.html', 'utf8');
const problems = [];

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const seen = new Set();
for (const id of ids) { if (seen.has(id)) problems.push(`duplicate id: ${id}`); seen.add(id); }

for (const [, target] of html.matchAll(/href="#([^"]*)"/g)) {
  if (target && !seen.has(target)) problems.push(`broken in-page link: #${target}`);
}

const external = new Set([...html.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1]));
for (const [, href] of html.matchAll(/href="([^"#][^"]*)"/g)) {
  if (!/^https?:\/\//.test(href) && !href.startsWith('/')) problems.push(`suspicious link: ${href}`);
}

const sections = [...html.matchAll(/<section class="module" id="([^"]+)"(?![^>]*data-kind="appendix")[^>]*>([\s\S]*?)<\/section>/g)];
for (const [, id, body] of sections) {
  if (id === 'how-to-use') continue;
  if (!body.includes('class="recap"')) problems.push(`${id}: no recap`);
  if (!body.includes('class="check"')) problems.push(`${id}: no self-check`);
}

console.log(`${seen.size} ids, ${external.size} distinct external links, ${sections.length} modules checked`);
if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log('✓ all checks passed');
