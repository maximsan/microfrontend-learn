/** Project-health badge in the reference library: kind = "live" | "dead" | "spec". */
export const Badge = ({ kind, children }) => <span className={`badge ${kind}`}>{children}</span>;
