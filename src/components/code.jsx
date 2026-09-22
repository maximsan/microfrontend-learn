import { Children, cloneElement } from 'react';

// Fenced code blocks and tables produced by Markdown.
//
// A fenced block takes its props from the info string (rehype-mdx-code-props):
//
//   ```js file="apps/cart/webpack.config.js" label="Remote — exposes" warn={[18]}
//
//   file  – shown top-left
//   label – shown top-right in accent colour
//   warn  – 1-based line numbers to highlight as "this is the trap"
//
// Comments (//, /* */, <!-- -->) are dimmed automatically.

export function Pre({ file, label, warn = [], children }) {
  const code = children?.props ?? {};
  const text = String(code.children ?? '').replace(/\n$/, '');
  return (
    <div className="codewrap">
      {file || label ? (
        <div className="fname">
          <span>{file}</span>
          {label ? <em>{label}</em> : null}
        </div>
      ) : null}
      <pre><code>{highlight(text, new Set(warn))}</code></pre>
    </div>
  );
}

/**
 * Tables scroll horizontally inside a frame on wide screens. On phones, tables
 * with three or more columns become one card per row: every body cell gets a
 * data-label with its column header, which the stylesheet prints above it.
 */
export function Table({ children, ...props }) {
  const kids = Children.toArray(children);
  const head = kids.find((k) => k.type === 'thead');
  const headRow = head && Children.toArray(head.props.children).find((r) => r.type === 'tr');
  const labels = headRow ? Children.toArray(headRow.props.children).map(textOf) : [];
  const cols = labels.length;
  const labelled = kids.map((k) =>
    k.type !== 'tbody' ? k : cloneElement(k, {}, Children.map(k.props.children, (row) =>
      row?.type !== 'tr' ? row : cloneElement(row, {}, Children.map(row.props.children, (cell, i) =>
        cell?.type === 'td' || cell?.type === 'th' ? cloneElement(cell, { 'data-label': labels[i] || undefined }) : cell)))));
  return (
    <div className="tscroll">
      <table {...props} className={cols >= 3 ? 'stack' : `cols-${cols}`}>{labelled}</table>
    </div>
  );
}

function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return textOf(node.props?.children).trim();
}

/* ---------- a deliberately tiny highlighter: comments only ---------- */

function highlight(text, warn) {
  const out = [];
  let state = null; // null | '*/' | '-->' while inside a multi-line comment
  text.split('\n').forEach((line, i) => {
    if (i > 0) out.push('\n');
    if (warn.has(i + 1)) {
      const indent = line.match(/^\s*/)[0];
      out.push(indent, <span key={i} className="warnline">{line.slice(indent.length)}</span>);
      return;
    }
    const [parts, next] = splitComments(line, state);
    state = next;
    parts.forEach(([isComment, s], j) =>
      out.push(isComment ? <span key={`${i}.${j}`} className="cmt">{s}</span> : s),
    );
  });
  return out;
}

function splitComments(line, state) {
  const parts = [];
  let buf = '';
  let i = 0;
  const flush = (isComment) => { if (buf) parts.push([isComment, buf]); buf = ''; };

  if (state) {
    const end = line.indexOf(state);
    if (end === -1) return [[[true, line]], state];
    buf = line.slice(0, end + state.length);
    flush(true);
    i = end + state.length;
    state = null;
  }

  let quote = null;
  while (i < line.length) {
    const c = line[i];
    if (quote) {
      buf += c;
      if (c === '\\') { buf += line[i + 1] ?? ''; i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; buf += c; i++; continue; }

    const rest = line.slice(i);
    const open = rest.startsWith('//') ? '' : rest.startsWith('/*') ? '*/' : rest.startsWith('<!--') ? '-->' : null;
    if (open === '') { flush(false); buf = rest; flush(true); return [parts, null]; }
    if (open) {
      flush(false);
      const end = rest.indexOf(open, 2);
      if (end === -1) { buf = rest; flush(true); return [parts, open]; }
      buf = rest.slice(0, end + open.length);
      flush(true);
      i += end + open.length;
      continue;
    }
    buf += c;
    i++;
  }
  flush(false);
  return [parts, null];
}
