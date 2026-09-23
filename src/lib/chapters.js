// The chapter registry used for cross-references, filled by the build before rendering.
// Chapters are numbered from their file order, so renumbering never means editing references.

let chapters = new Map();

/** Called by the build before rendering. */
export function setChapters(metas) {
  chapters = new Map(metas.map((m) => [m.id, m]));
}

/** The chapter with this id. An unknown id fails the build. */
export function chapter(id) {
  const c = chapters.get(id);
  if (!c) throw new Error(`<Mod to="${id}"> refers to an unknown chapter id`);
  return c;
}

/** "Module 12" or "Appendix C". */
export const label = (c) => (c.appendix ? `Appendix ${c.num}` : `Module ${c.num}`);
