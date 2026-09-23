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
