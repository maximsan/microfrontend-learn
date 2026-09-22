// Boxed callouts, recaps and self-checks.

const DEFAULT_TAG = {
  insight: 'Insight',
  trap: 'Trap',
  verified: 'From the source',
  correction: 'Ground has moved',
};

/**
 * Generic callout. Prefer the named variants below.
 *   title – appended to the default label: "Trap · <title>"
 *   tag   – replaces the whole label
 */
export function Callout({ kind, title, tag, children }) {
  const label = tag ?? (title ? <>{DEFAULT_TAG[kind]} · {title}</> : DEFAULT_TAG[kind]);
  return (
    <div className={`call ${kind}`}>
      <span className="tag">{label}</span>
      {children}
    </div>
  );
}

/** The author's own analysis — a point worth remembering. */
export const Insight = (p) => <Callout kind="insight" {...p} />;
/** A mistake people commonly make. */
export const Trap = (p) => <Callout kind="trap" {...p} />;
/** A verbatim quote from a spec, RFC or official documentation. End it with <Cite>. */
export const Source = (p) => <Callout kind="verified" {...p} />;
/** Something that has changed recently and that older material gets wrong. */
export const Moved = (p) => <Callout kind="correction" {...p} />;

/** Attribution line at the end of a <Source> (or any callout). */
export const Cite = ({ children }) => <cite>{children}</cite>;

/** End-of-module summary. Put a Markdown bullet list inside. */
export const Recap = ({ children }) => (
  <div className="recap">
    <span className="tag">Recap</span>
    {children}
  </div>
);

/** Self-check questions: a numbered list, optionally followed by <Answers>. */
export const Check = ({ children }) => (
  <div className="check">
    <span className="tag">Check yourself</span>
    {children}
  </div>
);

/** Collapsible answers inside <Check>. */
export const Answers = ({ children }) => (
  <details>
    <summary>Answers</summary>
    {children}
  </details>
);

/** A paragraph that is one verbatim quotation — the usual body of a <Source>. */
export const Quote = ({ children }) => (
  <p><q>{children}</q></p>
);
