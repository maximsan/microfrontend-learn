// One-off: convert legacy/original.html into content/*.mdx.
// Kept in history for reproducibility; not part of the normal build.
import * as cheerio from 'cheerio';
import fs from 'node:fs';

const $ = cheerio.load(fs.readFileSync('legacy/original.html', 'utf8'));
const out = {};

/* ---------------- helpers ---------------- */

const isWs = (n) => n.type === 'text' && !n.data.trim();
const kids = (el) => $(el).contents().toArray().filter((n) => n.type !== 'comment');
const cls = (el) => ($(el).attr('class') || '').split(/\s+/).filter(Boolean);
const has = (el, c) => cls(el).includes(c);
const style = (el) => $(el).attr('style') || '';
const fail = (msg, el) => { throw new Error(`${msg}: ${$.html(el).slice(0, 200)}`); };

const attr = (name, v) => {
  if (v === undefined || v === null || v === false) return '';
  if (v === true) return ` ${name}`;
  if (typeof v === 'number') return ` ${name}={${v}}`;
  if (typeof v === 'object') return ` ${name}={${v.jsx}}`;
  return /["\\{}]/.test(v) ? ` ${name}={${JSON.stringify(v)}}` : ` ${name}="${v}"`;
};

// Map a span to a component name, or null.
function spanComponent(el) {
  const s = style(el);
  if (has(el, 'verified-date')) return { self: '<VerifiedDate />' };
  if (s.startsWith('display:block;color:var(--muted)')) return { name: 'Sub' };
  if (s === 'color:var(--server);font-weight:600') return { name: 'ServerSide' };
  if (s === 'color:var(--client);font-weight:600') return { name: 'ClientSide' };
  if (s === 'font-weight:400') return { name: 'Light' };
  if (has(el, 'rev')) return { self: `<Rev kind="${cls(el).find((c) => c !== 'rev')}" />` };
  if (has(el, 'expiry')) return { name: 'Expiry' };
  if (has(el, 'badge')) return { name: 'Badge', attrs: attr('kind', cls(el).find((c) => c !== 'badge')) };
  if (has(el, 'src')) return { name: 'Src' };
  if (has(el, 'chip') && has(el, 'star')) return { name: 'Chip', attrs: ' kind="star"' + (s ? ' inline' : '') };
  return null;
}

/* ---------- inline → Markdown ---------- */

function escText(t, ctx) {
  let s = t.replace(/\s+/g, ' ');
  s = s.replace(/\\/g, '\\\\').replace(/([*`\[\]<{}~])/g, '\\$1');
  s = s.replace(/(^|[^\w])_|_(?=[^\w]|$)/g, (m) => m.replace('_', '\\_'));
  s = s.replace(/&(?=[#\w]+;)/g, '&amp;');
  if (ctx.table) s = s.replace(/\|/g, '\\|');
  return s;
}

const PUNCT = /[\p{P}\p{S}]/u;
const ALNUM = /[\p{L}\p{N}]/u;

function inl(el, ctx = {}) {
  const nodes = kids(el);
  let s = '';
  nodes.forEach((n, i) => {
    const prev = s.slice(-1);
    const next = nextChar(nodes, i);
    s += inlNode(n, ctx, prev, next);
  });
  return s;
}

function nextChar(nodes, i) {
  for (let j = i + 1; j < nodes.length; j++) {
    const t = $(nodes[j]).text();
    if (t) return t[0];
  }
  return '';
}

function wrapDelim(delim, tag, inner, prev, next) {
  const lead = inner.match(/^\s*/)[0] ? ' ' : '';
  const trail = inner.match(/\s*$/)[0] ? ' ' : '';
  const body = inner.trim();
  if (!body) return lead || trail;
  const f = body[0], l = body[body.length - 1];
  const risky =
    (PUNCT.test(f) && ALNUM.test(lead ? ' ' : prev)) ||
    (PUNCT.test(l) && ALNUM.test(trail ? ' ' : next)) ||
    body.includes(delim[0] + delim[0] + delim[0]);
  return lead + (risky ? `<${tag}>${body}</${tag}>` : `${delim}${body}${delim}`) + trail;
}

function inlNode(n, ctx, prev, next) {
  if (n.type === 'text') return escText(n.data, ctx);
  if (n.type !== 'tag') return '';
  const tag = n.tagName;
  switch (tag) {
    case 'strong':
    case 'b':
      return wrapDelim('**', 'strong', inl(n, ctx), prev, next);
    case 'em':
    case 'i':
      return wrapDelim('*', 'em', inl(n, ctx), prev, next);
    case 'code': {
      let t = $(n).text().replace(/\s+/g, ' ');
      if (ctx.table) t = t.replace(/\|/g, '\\|');
      const fence = t.includes('`') ? '``' : '`';
      const pad = t.startsWith('`') || t.endsWith('`') ? ' ' : '';
      return `${fence}${pad}${t}${pad}${fence}`;
    }
    case 'a': {
      const href = $(n).attr('href');
      const h = /[()\s]/.test(href) ? `<${href}>` : href;
      return `[${inl(n, ctx)}](${h})`;
    }
    case 'q':
      return `<q>${inl(n, ctx)}</q>`;
    case 'br':
      return '<br />';
    case 'span': {
      const c = spanComponent(n);
      if (!c) fail('Unknown span', n);
      if (c.self) return c.self;
      return `<${c.name}${c.attrs || ''}>${inl(n, ctx)}</${c.name}>`;
    }
    default:
      fail(`Unknown inline <${tag}>`, n);
  }
}

/* ---------- inline → JSX (for props) ---------- */

function jsxText(t) {
  return t.replace(/\s+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/[{}]/g, (c) => `{'${c}'}`);
}

function jsxInl(el) {
  return kids(el).map(jsxNode).join('');
}

function jsxNode(n) {
  if (n.type === 'text') return jsxText(n.data);
  if (n.type !== 'tag') return '';
  const tag = n.tagName;
  if (['code', 'em', 'strong', 'b', 'q', 'i'].includes(tag)) return `<${tag}>${jsxInl(n)}</${tag}>`;
  if (tag === 'a') return `<a href="${$(n).attr('href')}">${jsxInl(n)}</a>`;
  if (tag === 'br') return '<br />';
  if (tag === 'span') {
    const c = spanComponent(n);
    if (!c) fail('Unknown span (jsx)', n);
    if (c.self) return c.self;
    return `<${c.name}${c.attrs || ''}>${jsxInl(n)}</${c.name}>`;
  }
  fail(`Unknown jsx inline <${tag}>`, n);
}

/** A prop value: plain string when there is no markup, JSX fragment otherwise. */
function propOf(el) {
  const k = kids(el);
  if (k.every((n) => n.type === 'text')) return $(el).text().replace(/\s+/g, ' ').trim();
  return { jsx: `<>${jsxInl(el).trim()}</>` };
}

/* ---------- blocks ---------- */

function para(s) {
  s = s.trim();
  s = s.replace(/^(\d+)([.)])(\s)/, '$1\\$2$3').replace(/^([#>+-])(\s)/, '\\$1$2');
  if (/^</.test(s) && />$/.test(s)) return `<p>${s}</p>`;
  return s;
}

function list(el, ordered) {
  return $(el).children('li').toArray().map((li, i) => {
    if ($(li).children('p,ul,ol,div').length) fail('Block content in li', li);
    return `${ordered ? `${i + 1}.` : '-'} ${inl(li).trim()}`;
  }).join('\n');
}

function blocks(parent) {
  const parts = [];
  for (const n of kids(parent)) {
    if (isWs(n)) continue;
    if (n.type === 'text') fail('Stray text', parent);
    parts.push(block(n));
  }
  return parts.filter(Boolean).join('\n\n');
}

function block(el) {
  const tag = el.tagName;
  if (tag === 'p') {
    if (has(el, 'flowcap')) return `<FlowCaption>${inl(el).trim()}</FlowCaption>`;
    if (style(el).startsWith('margin-top:36px')) return `<Colophon>${inl(el).trim()}</Colophon>`;
    if (has(el, 'lede')) return `<Lede${style(el) ? ' small' : ''}>${inl(el).trim()}</Lede>`;
    if (cls(el).length || style(el)) fail('Unknown p', el);
    return para(inl(el));
  }
  if (tag === 'h3' || tag === 'h4') return `${tag === 'h3' ? '###' : '####'} ${inl(el).trim()}`;
  if (tag === 'ul' && !cls(el).length) return list(el, false);
  if (tag === 'ol' && !cls(el).length) return list(el, true);
  if (tag === 'ul' && has(el, 'tl')) return timeline(el);
  if (tag === 'cite') return `<Cite>${inl(el).trim()}</Cite>`;
  if (tag === 'dl' && has(el, 'acro')) return acronyms(el);
  if (tag === 'dl' && has(el, 'gloss')) return glossary(el);
  if (tag === 'div') {
    if (has(el, 'call')) return callout(el);
    if (has(el, 'recap')) return `<Recap>\n${blocks(withoutTag(el))}\n</Recap>`;
    if (has(el, 'check')) return check(el);
    if (has(el, 'tscroll')) return table($(el).children('table')[0]);
    if (has(el, 'codewrap')) return code(el);
    if (has(el, 'spectrum')) return spectrum(el);
    if (has(el, 'flow')) return flow(el);
    if (has(el, 'wire')) return wire(el);
    if (has(el, 'dtree')) return tree(el);
    if (has(el, 'refgrp')) return `<RefGroup${attr('title', $(el).children('h4').text())}>\n${list($(el).children('ul')[0], false)}\n</RefGroup>`;
  }
  fail(`Unknown block <${tag}>`, el);
}

function withoutTag(el) {
  const c = $(el).clone();
  c.children('.tag').remove();
  return c[0];
}

const CALLOUT = {
  insight: ['Insight', 'Insight'],
  trap: ['Trap', 'Trap'],
  verified: ['Source', 'From the source'],
  correction: ['Moved', 'Ground has moved'],
};

function callout(el) {
  const kind = cls(el).find((c) => CALLOUT[c]);
  const [name, def] = CALLOUT[kind];
  const tagEl = $(el).children('.tag').first().clone();
  const text = tagEl.text().trim();
  let a = '';
  if (text !== def) {
    const prefix = `${def} · `;
    if (text.startsWith(prefix)) {
      const first = tagEl.contents().first();
      first[0].data = first[0].data.replace(/^\s*/, '').slice(prefix.length);
      a = attr('title', propOf(tagEl[0]));
    } else {
      a = attr('tag', propOf(tagEl[0]));
    }
  }
  return `<${name}${a}>\n${blocks(withoutTag(el))}\n</${name}>`;
}

function check(el) {
  const ol = $(el).children('ol')[0];
  const det = $(el).children('details')[0];
  let s = `<Check>\n${list(ol, true)}`;
  if (det) s += `\n\n<Answers>\n${list($(det).children('ol')[0], true)}\n</Answers>`;
  return `${s}\n</Check>`;
}

function table(t) {
  const rows = $(t).find('tr').toArray();
  const bodyTh = $(t).find('tbody th').length > 0;
  const cell = (c) => {
    const status = ['ok', 'no', 'warn'].find((k) => has(c, k));
    const inner = inl(c, { table: true }).trim();
    return status ? `<${status[0].toUpperCase() + status.slice(1)}>${inner}</${status[0].toUpperCase() + status.slice(1)}>` : inner;
  };
  if (!bodyTh) {
    const head = $(t).find('thead tr').first().children().toArray().map(cell);
    const body = $(t).find('tbody tr').toArray().map((r) => $(r).children().toArray().map(cell));
    const line = (cells) => `| ${cells.join(' | ')} |`;
    return [line(head), line(head.map(() => '---')), ...body.map(line)].join('\n');
  }
  // Row headers: JSX table.
  const jcell = (c) => {
    const status = ['ok', 'no', 'warn'].find((k) => has(c, k));
    return `<${c.tagName}${status ? ` className="${status}"` : ''}>${jsxInl(c).trim()}</${c.tagName}>`;
  };
  const tr = (r) => `<tr>${$(r).children().toArray().map(jcell).join('')}</tr>`;
  return [
    '<Table>',
    `<thead>${$(t).find('thead tr').toArray().map(tr).join('')}</thead>`,
    '<tbody>',
    ...$(t).find('tbody tr').toArray().map(tr),
    '</tbody>',
    '</Table>',
  ].join('\n');
}

function code(el) {
  const file = $(el).find('.fname > span').first().text();
  const label = $(el).find('.fname > em').first().text();
  const codeEl = $(el).find('pre > code')[0];
  let cur = '';
  const warn = [];
  const walk = (n) => {
    if (n.type === 'text') cur += n.data;
    else if (n.type === 'tag') {
      const isWarn = has(n, 'warnline');
      const before = (cur.match(/\n/g) || []).length + 1;
      kids(n).forEach(walk);
      if (isWarn) warn.push(before);
    }
  };
  kids(codeEl).forEach(walk);
  const text = cur.replace(/\n$/, '');
  const ext = (file.match(/\.(\w+)(?:\s|$)/) || [])[1] || '';
  const lang = { jsx: 'jsx', js: 'js', html: 'html' }[ext] || 'text';
  return `\`\`\`${lang}${attr('file', file)}${attr('label', label)}${warn.length ? ` warn={[${warn.join(', ')}]}` : ''}\n${text}\n\`\`\``;
}

function spectrum(el) {
  const side = { 'var(--server)': 'server', 'var(--ink-2)': 'mid', 'var(--client)': 'client' };
  const pts = $(el).find('.spec-row').toArray().map((r) => {
    const dot = $(r).find('.spec-dot');
    const [, pos, bg] = style(dot[0]).match(/left:(\d+)%;background:(.*)$/);
    return `<Point pos={${pos}} side="${side[bg]}">${inl($(r).find('.lbl')[0]).trim()}</Point>`;
  });
  return `<Spectrum>\n${pts.join('\n')}\n</Spectrum>`;
}

function timeline(el) {
  const eras = $(el).children('li').toArray().map((li) => {
    const yr = $(li).children('.yr').text();
    const dir = has(li, 'era-server') ? 'server' : 'client';
    const title = propOf($(li).children('.ev')[0]);
    const c = $(li).clone();
    c.children('.yr,.dir,.ev').remove();
    return `<Era${attr('yr', yr)} dir="${dir}"${attr('title', title)}>\n${blocks(c[0])}\n</Era>`;
  });
  return `<Timeline>\n${eras.join('\n\n')}\n</Timeline>`;
}

function flow(el) {
  const items = $(el).children().toArray().map((n) => {
    if (has(n, 'box')) {
      const kind = cls(n).find((c) => c === 'good' || c === 'hot');
      return `<Box${attr('kind', kind)}${attr('title', propOf($(n).children('b')[0]))}>${inl($(n).children('span')[0]).trim()}</Box>`;
    }
    if (has(n, 'arrow')) {
      const sym = $(n).children('i').text();
      return `<Arrow${sym !== '→' ? attr('sym', sym) : ''}>${inl($(n).children('em')[0]).trim()}</Arrow>`;
    }
    fail('Unknown flow item', n);
  });
  return `<Flow>\n${items.join('\n')}\n</Flow>`;
}

function wire(el) {
  const steps = $(el).children('.step').toArray().map((s) => {
    const t = $(s).children('.t');
    const rev = t.children('.rev');
    const revKind = rev.length ? cls(rev[0]).find((c) => c !== 'rev') : undefined;
    const tc = t.clone();
    tc.children('.rev').remove();
    return `<Step${attr('t', tc.text().trim())}${attr('server', has(s, 'srv'))}${attr('rev', revKind)}>${inl($(s).children('.d')[0]).trim()}</Step>`;
  });
  return `<Wire>\n${steps.join('\n')}\n</Wire>`;
}

function tree(el) {
  const q = propOf($(el).children('.q')[0]);
  return `<Tree${attr('q', q)}>\n${treeKids($(el).children('.kids')[0], '  ')}\n</Tree>`;
}

function treeKids(kidsEl, ind) {
  const nodes = $(kidsEl).children().toArray();
  const lines = [];
  for (let i = 0; i < nodes.length; i++) {
    const row = nodes[i];
    if (!has(row, 'row')) fail('Expected .row', row);
    const chipEl = $(row).children('.chip')[0];
    const chip = cls(chipEl).find((c) => c !== 'chip');
    const label = $(chipEl).text();
    const labelAttr = label === chip.charAt(0).toUpperCase() + chip.slice(1) ? '' : attr('label', label);
    const qEl = $(row).children('span.q')[0];
    if (qEl) {
      const sub = nodes[++i];
      lines.push(`${ind}<Branch chip="${chip}"${labelAttr}${attr('q', propOf(qEl))}>`);
      lines.push(treeKids(sub, ind + '  '));
      lines.push(`${ind}</Branch>`);
    } else {
      const out = $(row).children('.out').clone();
      const side = cls(out[0]).find((c) => c !== 'out');
      const whyEl = out.children('.why');
      const why = whyEl.length ? propOf(whyEl[0]) : undefined;
      whyEl.remove();
      lines.push(`${ind}<Leaf chip="${chip}"${labelAttr} side="${side}"${attr('why', why)}>${inl(out[0]).trim()}</Leaf>`);
    }
  }
  return lines.join('\n');
}

function acronyms(el) {
  const rows = $(el).children('.row2').toArray().map((r) => {
    const term = $(r).children('dt').text().trim();
    if ($(r).attr('id') !== `acro-${term.toLowerCase()}`) fail('Acronym id mismatch', r);
    return `<Acro term="${term}">${inl($(r).children('dd')[0]).trim()}</Acro>`;
  });
  return `<Acronyms>\n${rows.join('\n')}\n</Acronyms>`;
}

function glossary(el) {
  const rows = $(el).children('.gterm').toArray().map((r) =>
    `<Term${attr('name', propOf($(r).children('dt')[0]))}>${inl($(r).children('dd')[0]).trim()}</Term>`);
  return `<Glossary>\n${rows.join('\n')}\n</Glossary>`;
}

/* ---------------- chapters ---------------- */

const nav = {};
let group = '';
$('#toc').children().each((_, n) => {
  if (has(n, 'grp')) group = $(n).text().trim();
  else $(n).find('a').each((__, a) => {
    nav[$(a).attr('href').slice(1)] = { num: $(a).find('.n').text(), label: $(a).children('span').last().text(), group };
  });
});

const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

$('main > section.module').each((i, sec) => {
  const id = $(sec).attr('id');
  const n = nav[id];
  const inner = $(sec).children('.wrap, .wide')[0];
  const head = $(inner).children('.modhead');
  const fm = {
    id,
    num: n.num,
    group: n.group,
    kicker: head.children('.modnum').text().trim(),
    title: head.children('h2').text().trim(),
    nav: n.label,
    standfirst: head.children('.standfirst').text().replace(/\s+/g, ' ').trim(),
  };
  if (fm.nav === fm.title) delete fm.nav;
  if ($(sec).attr('data-kind') === 'appendix') fm.appendix = true;
  if (has(inner, 'wide')) fm.wide = true;
  const body = $(inner).clone();
  body.children('.modhead').remove();
  const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
  const file = fm.appendix ? `app-${n.num.toLowerCase()}-${slug(n.label)}.mdx` : `${n.num}-${slug(n.label)}.mdx`;
  out[file] = `---\n${yaml}\n---\n\n${blocks(body[0])}\n`;
});

// Hero partial: the lede paragraphs.
const top = $('#top .wrap').clone();
top.children('.eyebrow, h2, .meta').remove();
out['_hero.mdx'] = `${blocks(top[0])}\n`;

for (const f of fs.readdirSync('content')) fs.unlinkSync(`content/${f}`);
for (const [f, s] of Object.entries(out)) fs.writeFileSync(`content/${f}`, s);
console.log(Object.keys(out).join('\n'));
