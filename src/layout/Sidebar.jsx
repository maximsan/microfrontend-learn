// The sidebar: book title and theme switch, table of contents grouped by part, and the sources note.
import book from '../../book.config.mjs';
import { VerifiedDate } from '../components/inline/VerifiedDate.jsx';
import { Mod } from '../components/xref/Mod.jsx';
import { ChapterLink } from '../components/xref/ChapterLink.jsx';
import { shortTitle } from '../lib/chapters.js';
import { groupConsecutive } from '../lib/groupConsecutive.js';

export const Sidebar = ({ chapters }) => (
  <aside id="side">
    <div className="brand">
      <span className="mark">{book.mark}</span>
      <h1>{book.title}</h1>
      <p>{book.tagline}</p>
      <button className="iconbtn themebtn" data-theme-toggle="text">Switch colour theme</button>
    </div>
    <nav id="toc" aria-label="Contents">
      {groupConsecutive(chapters, (c) => c.meta.part).map(([part, items]) => (
        <TocGroup key={part} label={part} items={items} />
      ))}
    </nav>
    <div className="sidefoot">
      Sources verified <VerifiedDate />. Anything not independently confirmed is flagged in <Mod to="caveats" />.
    </div>
  </aside>
);

/** One part of the book in the table of contents. */
const TocGroup = ({ label, items }) => (
  <>
    <div className="grp">{label}</div>
    <ol>
      {items.map(({ meta }) => (
        <li key={meta.id}>
          <ChapterLink chapter={meta} className={null}>
            <span className="n">{meta.num}</span>
            <span>{shortTitle(meta)}</span>
          </ChapterLink>
        </li>
      ))}
    </ol>
  </>
);
