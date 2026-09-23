/** Decision-tree chip: kind = "yes" | "no" | "star". `inline` adds a left gap. */
export const Chip = ({ kind, inline, children }) => (
  <span className={inline ? `chip ${kind} inline` : `chip ${kind}`}>{children}</span>
);
