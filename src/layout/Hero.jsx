// The title screen: eyebrow, title, the introduction from content/_hero.mdx, and the stats line.
import book from '../../book.config.mjs';
import { VerifiedDate } from '../components/inline/VerifiedDate.jsx';

export const Hero = ({ stats, children }) => (
  <section id="top">
    <div className="wrap">
      <p className="eyebrow">{book.eyebrow}</p>
      <h2>{book.title}</h2>
      {children}
      <div className="meta">
        <span>
          <b data-count="modules">{stats.modules} modules</b> + <span data-count="appendices">{stats.appendices} appendices</span>
        </span>
        <span><b data-count="readtime">{stats.readtime}</b> read end to end</span>
        <span><b>Verified</b> <VerifiedDate /></span>
      </div>
    </div>
  </section>
);
