import { Chip } from '../inline/Chip.jsx';

/** Root of a decision tree. `q` is the first question; children are <Branch>/<Leaf>. */
export const Tree = ({ q, children }) => (
  <div className="dtree">
    <div className="q">{q}</div>
    <div className="kids">{children}</div>
  </div>
);

/**
 * An answer that leads to a follow-up question.
 *   chip  – "yes" | "no" (colour of the answer chip)
 *   label – text on the chip, defaults to Yes/No
 */
export const Branch = ({ chip, label, q, children }) => (
  <>
    <div className="row">
      <Chip kind={chip}>{label ?? cap(chip)}</Chip>
      <span className="q" style={{ padding: 0 }}>{q}</span>
    </div>
    <div className="kids">{children}</div>
  </>
);

/** An answer that ends in an outcome. side = "srv" | "cli" | "mid". */
export const Leaf = ({ chip, label, side, why, children }) => (
  <div className="row">
    <Chip kind={chip}>{label ?? cap(chip)}</Chip>
    <span className={`out ${side}`}>
      {children}
      {why ? <span className="why">{why}</span> : null}
    </span>
  </div>
);

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
