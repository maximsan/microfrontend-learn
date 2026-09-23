// Previous / next links at the end of every chapter.
import { ChapterLink } from '../components/xref/ChapterLink.jsx';
import { label, shortTitle } from '../lib/chapters.js';

export function Pager({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Chapter navigation">
      <PagerLink chapter={prev} dir="prev" />
      <PagerLink chapter={next} dir="next" />
    </nav>
  );
}

/** One side of the pager; an empty placeholder keeps the other side in place. */
const PagerLink = ({ chapter, dir }) =>
  chapter ? (
    <ChapterLink chapter={chapter} className={`pg ${dir}`}>
      <span className="pg-k">{dir === 'prev' ? '← Previous' : 'Next →'}</span>
      <span className="pg-t">{label(chapter)} · {shortTitle(chapter)}</span>
    </ChapterLink>
  ) : <span className="pg" aria-hidden="true"></span>;
