// Cross-references between chapters, resolved at build time.
//
//   <Mod to="auth" />          → "Module 12"  (linked)
//   <Mod to="caveats" />       → "Appendix C" (linked)
//   <Mod to="auth" num />      → "12"         (linked, number only — for "Modules 06–07")
//   <Mod to="auth" title />    → "Module 12 · Auth architecture"
import { chapter, label } from '../../lib/chapters.js';
import { ChapterLink } from './ChapterLink.jsx';
import { joinElements } from '../../lib/joinElements.jsx';

export function Mod({ to, num, title }) {
  const c = chapter(to);
  const text = num ? c.num : title ? `${label(c)} · ${c.title}` : label(c);
  return <ChapterLink chapter={c}>{text}</ChapterLink>;
}

/** A comma-separated list of linked module numbers: <Mods to={['spectrum', 'choosing']} /> → "02, 05". */
export const Mods = ({ to }) => joinElements(to, ', ', (id) => id, (id) => <Mod to={id} num />);
