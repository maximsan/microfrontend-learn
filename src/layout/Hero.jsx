// The title screen: eyebrow, title, the introduction from content/_hero.mdx, and the stats line.
import book from '../../book.config.mjs';
import { VerifiedDate } from '../components/inline/VerifiedDate.jsx';
import { plural } from '../lib/plural.js';

export const Hero = ({ stats, children }) => (
  <section id="top">
    <div className="wrap">
      <p className="eyebrow">{book.eyebrow}</p>
      <h2>{book.title}</h2>
      {children}
      <div className="meta">
        <span>
          <b>{plural(stats.modules, 'module', 'modules')}</b> + {plural(stats.appendices, 'appendix', 'appendices')}
        </span>
        <span><b>{stats.readtime}</b> read end to end</span>
        <span><b>Verified</b> <VerifiedDate /></span>
      </div>
    </div>
  </section>
);
