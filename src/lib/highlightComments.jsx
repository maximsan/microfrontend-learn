// A deliberately tiny highlighter for code blocks: comments only.
//   highlightComments(text, warnLines) → an array of strings and <span>s
// Comments (//, /* */, <!-- -->) get class "cmt"; lines in `warnLines` get "warnline".

export function highlightComments(text, warn) {
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
