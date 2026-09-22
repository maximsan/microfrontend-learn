// Diagram blocks: spectrum, timeline, request flows, wire sequences, decision trees.
import { Chip, Rev } from './inline.jsx';

/* ---------- Spectrum ---------- */

const SIDE_COLOR = { server: 'var(--server)', mid: 'var(--ink-2)', client: 'var(--client)' };

/** The server-owned → client-owned axis. Children are <Point>s. */
export const Spectrum = ({ children }) => (
  <div className="spectrum">
    <div className="spec-axis"><span className="s">Server-owned</span><span className="c">Client-owned</span></div>
    <div className="spec-bar"></div>
    <div className="spec-rows">{children}</div>
  </div>
);

/** One architecture on the axis. pos = 0–100, side = "server" | "mid" | "client". */
export const Point = ({ pos, side, children }) => (
  <div className="spec-row">
    <span className="lbl">{children}</span>
    <div className="spec-track">
      <span className="spec-dot" style={{ left: `${pos}%`, background: SIDE_COLOR[side] }}></span>
    </div>
  </div>
);

/* ---------- Timeline ---------- */

export const Timeline = ({ children }) => <ul className="tl">{children}</ul>;

/** One era. dir = "server" | "client" (which way the pendulum swung). Body is Markdown. */
export const Era = ({ yr, dir, title, children }) => (
  <li className={dir === 'server' ? 'era-server' : undefined}>
    <span className="yr">{yr}</span>
    <span className="dir">→ {dir}</span>
    <span className="ev">{title}</span>
    {children}
  </li>
);

/* ---------- Request flow ---------- */

/** A left-to-right chain of <Box> and <Arrow>. */
export const Flow = ({ children }) => <div className="flow">{children}</div>;

/** kind = "good" | "hot" | undefined */
export const Box = ({ kind, title, children }) => (
  <div className={kind ? `box ${kind}` : 'box'}>
    <b>{title}</b>
    <span>{children}</span>
  </div>
);

export const Arrow = ({ sym = '→', children }) => (
  <div className="arrow">
    <i>{sym}</i>
    <em>{children}</em>
  </div>
);

export const FlowCaption = ({ children }) => <p className="flowcap">{children}</p>;

/* ---------- Wire / step sequence ---------- */

export const Wire = ({ children }) => <div className="wire">{children}</div>;

/**
 * One step. `t` is the small label; `server` colours the dot as server-side;
 * `rev` adds a reversibility marker ("oneway" | "costly" | "cheap").
 */
export const Step = ({ t, server, rev, children }) => (
  <div className={server ? 'step srv' : 'step'}>
    <span className="t">
      {t}
      {rev ? <> <Rev kind={rev} /></> : null}
    </span>
    <span className="d">{children}</span>
  </div>
);

/* ---------- Decision tree ---------- */

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
