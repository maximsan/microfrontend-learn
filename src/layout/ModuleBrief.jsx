// Time, prerequisites, objectives and lab for one module, from its frontmatter.
import { ChapterLink } from '../components/xref/ChapterLink.jsx';
import { chapter, label, shortTitle } from '../lib/chapters.js';

export function ModuleBrief({ meta }) {
  const prereqs = (meta.prereqs ?? []).map(chapter);
  return (
    <dl className="brief">
      <div>
        <dt>Time</dt>
        <dd>{meta.minutes} min read{meta.lab ? ' + lab' : ''}</dd>
      </div>
      {prereqs.length ? (
        <div>
          <dt>Before this</dt>
          <dd>
            {prereqs.map((c, i) => (
              <span key={c.id}>{i ? ' · ' : ''}<ChapterLink chapter={c}>{label(c)} {shortTitle(c)}</ChapterLink></span>
            ))}
          </dd>
        </div>
      ) : null}
      {meta.objectives?.length ? (
        <div className="brief-obj">
          <dt>You will be able to</dt>
          <dd><ul>{meta.objectives.map((o) => <li key={o}>{o}</li>)}</ul></dd>
        </div>
      ) : null}
      {meta.lab ? (
        <div>
          <dt>Lab</dt>
          <dd><code>{meta.lab}</code> in the repository</dd>
        </div>
      ) : null}
    </dl>
  );
}
