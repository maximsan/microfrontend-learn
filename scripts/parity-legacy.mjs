// One-off: prove dist/index.html renders the same content as legacy/original.html.
// Compares, per section: normalised text, link targets, and the element skeleton.
import * as cheerio from 'cheerio';
import fs from 'node:fs';

const load = (f) => cheerio.load(fs.readFileSync(f, 'utf8'));
const A = load('legacy/original.html');
const B = load('dist/index.html');

const norm = (s) => s.replace(/\s+/g, ' ').trim();
// Text with a space at every block-level boundary, so markup whitespace between blocks is ignored
// but whitespace inside a line of prose still counts.
const BLOCK = new Set(['p','div','li','ul','ol','h1','h2','h3','h4','table','thead','tbody','tr','td','th','dl','dt','dd','section','pre','details','summary','cite','nav','aside']);
function text($, root) {
  let out = '';
  const walk = (n) => {
    if (n.type === 'text') { out += n.data; return; }
    if (n.type !== 'tag') return;
    const blk = BLOCK.has(n.tagName) || /\b(tag|t|d|yr|dir|ev|lbl|why|out|chip|src|badge|mark|n)\b/.test($(n).attr('class') || '');
    if (blk) out += ' ';
    (n.children || []).forEach(walk);
    if (blk) out += ' ';
  };
  walk(root);
  return norm(out);
}
const TAGMAP = { b: 'strong' };
function skeleton($, root) {
  const out = [];
  $(root).find('*').each((_, el) => {
    const t = TAGMAP[el.tagName] || el.tagName;
    const c = ($(el).attr('class') || '').split(/\s+/).filter(Boolean).sort().join('.');
    out.push(c ? `${t}.${c}` : t);
  });
  return out;
}
const links = ($, root) => $(root).find('a').toArray().map((a) => $(a).attr('href'));

let bad = 0;
const ids = ['top', ...A('main > section.module').toArray().map((s) => A(s).attr('id'))];
for (const id of ids) {
  const a = A(`main > section#${id}`)[0];
  const b = B(`main > section#${id}`)[0];
  if (!b) { console.log(`✗ ${id}: missing`); bad++; continue; }
  const problems = [];
  const ta = text(A, a), tb = text(B, b);
  if (ta !== tb) {
    let i = 0; while (ta[i] === tb[i]) i++;
    problems.push(`text differs at ${i}:\n    old: …${ta.slice(Math.max(0, i - 60), i + 80)}\n    new: …${tb.slice(Math.max(0, i - 60), i + 80)}`);
  }
  const la = links(A, a).join('\n'), lb = links(B, b).join('\n');
  if (la !== lb) problems.push('links differ');
  const sa = skeleton(A, a), sb = skeleton(B, b);
  const n = Math.max(sa.length, sb.length);
  for (let i = 0; i < n; i++) {
    if (sa[i] !== sb[i]) {
      problems.push(`skeleton differs at #${i}: old ${sa.slice(i, i + 4).join(' ')} | new ${sb.slice(i, i + 4).join(' ')}`);
      break;
    }
  }
  if (problems.length) { bad++; console.log(`✗ ${id}\n  ${problems.join('\n  ')}`); }
  else console.log(`✓ ${id}`);
}
// Sidebar and chrome
const side = (x) => text(x, x('#side')[0]);
if (side(A) !== side(B)) { bad++; console.log('✗ sidebar text differs'); } else console.log('✓ sidebar');
const inlineStyle = (x) => x('main [style]').toArray().map((e) => x(e).attr('style').replace(/\s/g, '')).sort().join('\n');
console.log(inlineStyle(A) === inlineStyle(B) ? '✓ inline styles' : '✗ inline styles differ');

// Code blocks must match character for character.
const pres = (x) => x('main pre').toArray().map((p) => x(p).text());
const pa = pres(A), pb = pres(B);
pa.forEach((p, i) => { if (p !== pb[i]) console.log(`✗ code block ${i} differs\n${JSON.stringify(p).slice(0, 300)}\n${JSON.stringify(pb[i]).slice(0, 300)}`); });
console.log(pa.length === pb.length && pa.every((p, i) => p === pb[i]) ? `✓ ${pa.length} code blocks identical` : '✗ code blocks');
const cmt = (x) => x('main pre .cmt, main pre .warnline').toArray().map((e) => x(e).text()).join('\n');
console.log(cmt(A) === cmt(B) ? '✓ comment/warn highlighting identical' : `✗ highlighting differs\n${cmt(A)}\n---\n${cmt(B)}`);
process.exit(bad ? 1 : 0);
