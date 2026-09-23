import { LabelledBox } from './LabelledBox.jsx';

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
  return <LabelledBox className={`call ${kind}`} label={label}>{children}</LabelledBox>;
}

const variant = (kind) => (props) => <Callout kind={kind} {...props} />;

/** The author's own analysis — a point worth remembering. */
export const Insight = variant('insight');
/** A mistake people commonly make. */
export const Trap = variant('trap');
/** A verbatim quote from a spec, RFC or official documentation. End it with <Cite>. */
export const Source = variant('verified');
/** Something that has changed recently and that older material gets wrong. */
export const Moved = variant('correction');
