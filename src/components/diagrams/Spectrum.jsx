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
      <span className={`spec-dot ${side}`} style={{ left: `${pos}%` }}></span>
    </div>
  </div>
);
