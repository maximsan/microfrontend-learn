import { Rev } from '../inline/Rev.jsx';

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
