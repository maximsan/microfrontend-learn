import { classed } from '../../lib/classed.jsx';
import { Rev } from '../inline/Rev.jsx';

/** A vertical sequence of <Step>s. */
export const Wire = classed('div', 'wire');

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
