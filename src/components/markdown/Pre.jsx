import { highlightComments } from '../../lib/highlightComments.jsx';

// Fenced code blocks produced by Markdown.
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
      <pre><code>{highlightComments(text, new Set(warn))}</code></pre>
    </div>
  );
}
