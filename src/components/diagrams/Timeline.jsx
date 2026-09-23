import { classed } from '../../lib/classed.jsx';

/** A vertical history of <Era>s. */
export const Timeline = classed('ul', 'tl');

/** One era. dir = "server" | "client" (which way the pendulum swung). Body is Markdown. */
export const Era = ({ yr, dir, title, children }) => (
  <li className={dir === 'server' ? 'era-server' : undefined}>
    <span className="yr">{yr}</span>
    <span className="dir">→ {dir}</span>
    <span className="ev">{title}</span>
    {children}
  </li>
);
