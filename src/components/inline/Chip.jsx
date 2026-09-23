/** Decision-tree chip: kind = "yes" | "no" | "star". `inline` adds a left gap. */
export const Chip = ({ kind, inline, children }) => (
  <span className={`chip ${kind}`} style={inline ? { marginLeft: 6 } : undefined}>{children}</span>
);
