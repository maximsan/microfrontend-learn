// Build the book: content/*.mdx → React (server-side only) → one self-contained HTML page.
//
//   npm run build          writes dist/index.html (open it in a browser)
//   npm run build:hosted   also writes dist/hosted.html: the same book without the
//                          <html>/<head>/<body> wrapper, which is the form the hosted
//                          copy on claude.ai is republished from (the host adds its own)
//   npm run watch     rebuilds on every change under content/ and src/
import fs from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (...p) => path.join(ROOT, ...p);

if (process.argv.includes('--watch')) {
  runWatch();
} else {
  await build();
}

async function build() {
  const t0 = Date.now();
  const { evaluate } = await import('@mdx-js/mdx');
  const runtime = await import('react/jsx-runtime');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { createElement: h } = await import('react');
  const remarkGfm = (await import('remark-gfm')).default;
  const remarkFrontmatter = (await import('remark-frontmatter')).default;
  const remarkMdxFrontmatter = (await import('remark-mdx-frontmatter')).default;
  const rehypeMdxCodeProps = (await import('rehype-mdx-code-props')).default;
  const rehypeCellStatus = (await import('../src/mdx/rehypeCellStatus.mjs')).default;
  const { mdxComponents } = await import('../src/components/index.js');
  const { setChapters } = await import('../src/lib/chapters.js');
  const { Page } = await import('../src/layout/Page.jsx');
  const book = (await import('../book.config.mjs')).default;

  const compile = async (file) => {
    const source = await fs.readFile(file, 'utf8');
    try {
      return await evaluate(
        { value: source, path: file },
        {
          ...runtime,
          baseUrl: pathToFileURL(file),
          remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
          rehypePlugins: [rehypeMdxCodeProps, rehypeCellStatus],
        },
      );
    } catch (err) {
      err.message = `${path.relative(ROOT, file)}: ${err.message}`;
      throw err;
    }
  };
  const render = (Mod) => h(Mod.default, { components: mdxComponents });

  // Chapters are ordered by file name; files starting with "_" are partials.
  const files = (await fs.readdir(rel('content')))
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .sort();
  const chapters = [];
  let moduleNo = 0;
  let appendixNo = 0;
  for (const f of files) {
    const mod = await compile(rel('content', f));
    const meta = { ...(mod.frontmatter ?? {}) };
    for (const k of ['id', 'part', 'title', 'standfirst']) {
      if (!meta[k]) throw new Error(`content/${f}: frontmatter is missing "${k}"`);
    }
    // Numbers come from file order: modules 00, 01, …; appendices A, B, …
    meta.num = meta.appendix ? String.fromCharCode(65 + appendixNo++) : String(moduleNo++).padStart(2, '0');
    meta.kicker = meta.appendix
      ? `Appendix ${meta.num}`
      : `Module ${meta.num}${meta.section ? ` · ${meta.section}` : ''}`;
    chapters.push({ file: f, meta, mod });
  }
  const dup = chapters.map((c) => c.meta.id).find((id, i, a) => a.indexOf(id) !== i);
  if (dup) throw new Error(`Duplicate chapter id "${dup}"`);
  setChapters(chapters.map((c) => c.meta));
  for (const c of chapters) {
    c.body = render(c.mod);
    c.meta.minutes = Math.max(1, Math.round(countWords(renderToStaticMarkup(c.body)) / 200));
  }

  const hero = render(await compile(rel('content', '_hero.mdx')));

  // Stats shown in the hero. The client script recomputes them the same way.
  const bodyHtml = renderToStaticMarkup(h(runtime.Fragment, null, ...chapters.map((c) => c.body)));
  const words = countWords(bodyHtml);
  const mins = Math.max(5, Math.round(words / 200 / 5) * 5);
  const stats = {
    modules: chapters.filter((c) => !c.meta.appendix).length,
    appendices: chapters.filter((c) => c.meta.appendix).length,
    readtime: mins < 60 ? `~${mins} min` : `~${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`,
  };

  const body = renderToStaticMarkup(h(Page, { hero, chapters, stats }));
  const css = await fs.readFile(rel('src/styles/book.css'), 'utf8');
  const js = await fs.readFile(rel('src/client/book.js'), 'utf8');

  const fonts = [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400&display=swap">',
  ].join('\n');
  const title = `<title>${escapeHtml(book.title)}</title>`;
  const inner = `<style>\n${css}</style>\n\n${body}\n\n<script>\n${js}</script>\n`;

  // Full document for opening locally.
  const full = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="${escapeHtml(book.tagline)}">
${title}
${fonts}
<style>:root{color-scheme:light}body{margin:0;padding:0}img{max-width:100%}</style>
</head>
<body>
${inner}</body>
</html>
`;

  await fs.mkdir(rel('dist'), { recursive: true });
  await fs.writeFile(rel('dist/index.html'), full);
  if (process.argv.includes('--hosted')) {
    // The hosting page supplies <html>, <head> and <body>; it wants only what goes inside.
    await fs.writeFile(rel('dist/hosted.html'), `${title}\n${fonts}\n\n${inner}`);
  }
  const kb = (Buffer.byteLength(full) / 1024).toFixed(0);
  console.log(`Built ${chapters.length} chapters, ${words} words, ${kb} KB → dist/index.html  (${Date.now() - t0} ms)`);
}

function runWatch() {
  let timer = null;
  let child = null;
  const run = () => {
    if (child) child.kill();
    child = spawn(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url)], { stdio: 'inherit' });
  };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 120); };
  for (const dir of ['content', 'src']) watch(rel(dir), { recursive: true }, schedule);
  watch(rel('book.config.mjs'), schedule);
  console.log('Watching content/ and src/ …');
  run();
}

function countWords(html) {
  return html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
