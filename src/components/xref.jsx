// Cross-references between chapters, resolved at build time.
//
//   <Mod to="auth" />          → "Module 12"  (linked)
//   <Mod to="caveats" />       → "Appendix C" (linked)
//   <Mod to="auth" num />      → "12"         (linked, number only — for "Modules 06–07")
//   <Mod to="auth" title />    → "Module 12 · Auth architecture"
//
// Chapters are numbered from their file order, so renumbering never means
// editing references. An unknown id fails the build.

let chapters = new Map();

/** Called by the build before rendering. */
export function setChapters(metas) {
  chapters = new Map(metas.map((m) => [m.id, m]));
}

export function chapter(id) {
  const c = chapters.get(id);
  if (!c) throw new Error(`<Mod to="${id}"> refers to an unknown chapter id`);
  return c;
}

export const label = (c) => (c.appendix ? `Appendix ${c.num}` : `Module ${c.num}`);

export function Mod({ to, num, title }) {
  const c = chapter(to);
  const text = num ? c.num : title ? `${label(c)} · ${c.title}` : label(c);
  return <a className="xref" href={`#${c.id}`}>{text}</a>;
}

/** A comma-separated list of linked module numbers: <Mods to={['spectrum', 'choosing']} /> → "02, 05". */
export function Mods({ to }) {
  return to.map((id, i) => (
    <span key={id}>{i ? ', ' : ''}<Mod to={id} num /></span>
  ));
}
