// Previous / next links at the end of every chapter.
import { label, shortTitle } from '../lib/chapters.js';

export function Pager({ prev, next, wide }) {
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Chapter navigation" style={wide ? { maxWidth: 'var(--measure)', marginInline: 'auto' } : undefined}>
      <PagerLink chapter={prev} dir="prev" />
      <PagerLink chapter={next} dir="next" />
    </nav>
  );
}

/** One side of the pager; an empty placeholder keeps the other side in place. */
const PagerLink = ({ chapter, dir }) =>
  chapter ? (
    <a className={`pg ${dir}`} href={`#${chapter.id}`}>
      <span className="pg-k">{dir === 'prev' ? '← Previous' : 'Next →'}</span>
      <span className="pg-t">{label(chapter)} · {shortTitle(chapter)}</span>
    </a>
  ) : <span className="pg" aria-hidden="true"></span>;
