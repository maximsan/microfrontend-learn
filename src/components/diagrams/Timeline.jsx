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
