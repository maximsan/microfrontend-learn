// Small inline pieces used inside prose and table cells.
import book from '../../book.config.mjs';

/** The single "sources verified" date, taken from book.config.mjs. */
export const VerifiedDate = () => <span className="verified-date">{book.verified}</span>;

/**
 * Status colouring for a table cell. When <Ok>, <No> or <Warn> is the only
 * thing in a cell, the rehype-cell-status plugin moves the class onto the <td>.
 */
export const Ok = ({ children }) => <span className="ok">{children}</span>;
export const No = ({ children }) => <span className="no">{children}</span>;
export const Warn = ({ children }) => <span className="warn">{children}</span>;

/** Small muted second line under a table-cell heading. */
export const Sub = ({ children }) => (
  <span style={{ display: 'block', color: 'var(--muted)', fontSize: 12 }}>{children}</span>
);

/** Text coloured as the server end or the client end of the spectrum. */
export const ServerSide = ({ children }) => (
  <span style={{ color: 'var(--server)', fontWeight: 600 }}>{children}</span>
);
export const ClientSide = ({ children }) => (
  <span style={{ color: 'var(--client)', fontWeight: 600 }}>{children}</span>
);

/** Regular-weight text inside a bold context (decision-tree outcomes). */
export const Light = ({ children }) => <span style={{ fontWeight: 400 }}>{children}</span>;

const REV_LABEL = { oneway: 'One-way', costly: 'Costly', cheap: 'Cheap' };
/** Reversibility marker: kind = "oneway" | "costly" | "cheap". */
export const Rev = ({ kind }) => <span className={`rev ${kind}`}>{REV_LABEL[kind]}</span>;

/** "Re-check in N months" pill used in Appendix C. */
export const Expiry = ({ children }) => <span className="expiry">{children}</span>;

/** Project-health badge in the reference library: kind = "live" | "dead" | "spec". */
export const Badge = ({ kind, children }) => <span className={`badge ${kind}`}>{children}</span>;

/** Grey note under a reference-library entry. */
export const Src = ({ children }) => <span className="src">{children}</span>;

/** Hero paragraph; `small` for the second, quieter one. */
export const Lede = ({ small, children }) => (
  <p className="lede" style={small ? { fontSize: 17 } : undefined}>{children}</p>
);

/** Muted closing line at the end of a chapter. */
export const Colophon = ({ children }) => (
  <p style={{ marginTop: 36, color: 'var(--muted)', fontSize: 15 }}>{children}</p>
);

/** Decision-tree chip: kind = "yes" | "no" | "star". `inline` adds a left gap. */
export const Chip = ({ kind, inline, children }) => (
  <span className={`chip ${kind}`} style={inline ? { marginLeft: 6 } : undefined}>{children}</span>
);
