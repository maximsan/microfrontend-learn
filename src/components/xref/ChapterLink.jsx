/** An in-page link to a chapter, styled as a cross-reference. */
export const ChapterLink = ({ chapter, children }) => <a className="xref" href={`#${chapter.id}`}>{children}</a>;
