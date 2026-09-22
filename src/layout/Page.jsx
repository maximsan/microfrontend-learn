// The page shell: sidebar contents, mobile bar, hero and one <section> per chapter.
import book from '../../book.config.mjs';
import { VerifiedDate } from '../components/inline.jsx';

/**
 * @param {{ hero: JSX.Element, chapters: { meta: object, body: JSX.Element }[], stats: object }} props
 */
export default function Page({ hero, chapters, stats }) {
  const groups = groupBy(chapters, (c) => c.meta.group);
  const first = chapters[0]?.meta.id;
  return (
    <>
      <a className="skip" href={`#${first}`}>Skip to contents</a>
      <div id="prog"><i></i></div>

      <div id="bar">
        <button className="iconbtn" id="menu" aria-label="Open contents" aria-expanded="false">Contents</button>
        <strong>{book.title}</strong>
        <button className="iconbtn" id="theme2" style={{ marginLeft: 'auto' }} aria-label="Toggle colour theme">Theme</button>
      </div>
      <div id="scrim"></div>

      <div id="shell">
        <aside id="side">
          <div className="brand">
            <span className="mark">{book.mark}</span>
            <h1>{book.title}</h1>
            <p>{book.tagline}</p>
          </div>
          <nav id="toc" aria-label="Contents">
            {groups.map(([group, items]) => (
              <Group key={group} label={group} items={items} />
            ))}
          </nav>
          <div className="sidefoot">
            Sources verified <VerifiedDate />. Anything not independently confirmed is flagged in Appendix C.
          </div>
        </aside>

        <main>
          <section id="top">
            <div className="wrap">
              <p className="eyebrow">{book.eyebrow}</p>
              <h2>{book.title}</h2>
              {hero}
              <div className="meta">
                <span>
                  <b data-count="modules">{stats.modules} modules</b> + <span data-count="appendices">{stats.appendices} appendices</span>
                </span>
                <span><b data-count="readtime">{stats.readtime}</b> read end to end</span>
                <span><b>Verified</b> <VerifiedDate /></span>
              </div>
            </div>
          </section>

          {chapters.map(({ meta, body }) => (
            <Chapter key={meta.id} meta={meta}>{body}</Chapter>
          ))}
        </main>
      </div>
    </>
  );
}

const Group = ({ label, items }) => (
  <>
    <div className="grp">{label}</div>
    <ol>
      {items.map(({ meta }) => (
        <li key={meta.id}>
          <a href={`#${meta.id}`}>
            <span className="n">{meta.num}</span>
            <span>{meta.nav ?? meta.title}</span>
          </a>
        </li>
      ))}
    </ol>
  </>
);

function Chapter({ meta, children }) {
  const head = (
    <div className="modhead" style={meta.wide ? { maxWidth: 'var(--measure)', marginLeft: 'auto', marginRight: 'auto' } : undefined}>
      <span className="modnum">{meta.kicker}</span>
      <h2>{meta.title}</h2>
      <p className="standfirst">{meta.standfirst}</p>
    </div>
  );
  return (
    <section className="module" id={meta.id} data-kind={meta.appendix ? 'appendix' : undefined}>
      <div className={meta.wide ? 'wide' : 'wrap'}>
        {head}
        {children}
      </div>
    </section>
  );
}

function groupBy(list, key) {
  const out = [];
  for (const item of list) {
    const k = key(item);
    const last = out[out.length - 1];
    if (last && last[0] === k) last[1].push(item);
    else out.push([k, [item]]);
  }
  return out;
}
