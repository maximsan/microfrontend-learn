/** An in-page link to a chapter. Styled as a cross-reference unless another class (or null, for none) is given. */
export const ChapterLink = ({ chapter, className = 'xref', children }) => (
  <a className={className} href={`#${chapter.id}`}>{children}</a>
);
