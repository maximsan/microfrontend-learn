// One chapter: its heading, the module brief, the MDX body and the pager.
import { ModuleBrief } from './ModuleBrief.jsx';
import { Pager } from './Pager.jsx';

export const Chapter = ({ meta, prev, next, children }) => (
  <section className="module" id={meta.id} data-kind={meta.appendix ? 'appendix' : undefined}>
    <div className={meta.wide ? 'wide' : 'wrap'}>
      <ChapterHead meta={meta} />
      {children}
      <Pager prev={prev} next={next} />
    </div>
  </section>
);

/** Kicker, title, standfirst and (for modules, not appendices) the brief. */
const ChapterHead = ({ meta }) => (
  <div className="modhead">
    <span className="modnum">{meta.kicker}</span>
    <h2>{meta.title}</h2>
    <p className="standfirst">{meta.standfirst}</p>
    {meta.appendix ? null : <ModuleBrief meta={meta} />}
  </div>
);
