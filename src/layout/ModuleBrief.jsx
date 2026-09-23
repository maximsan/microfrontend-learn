// Time, prerequisites, objectives and lab for one module, from its frontmatter.
import { ChapterLink } from '../components/xref/ChapterLink.jsx';
import { DefinitionRow } from '../components/reference/DefinitionRow.jsx';
import { chapter, label, shortTitle } from '../lib/chapters.js';
import { joinElements } from '../lib/joinElements.jsx';

export function ModuleBrief({ meta }) {
  const prereqs = (meta.prereqs ?? []).map(chapter);
  return (
    <dl className="brief">
      <DefinitionRow term="Time">{meta.minutes} min read{meta.lab ? ' + lab' : ''}</DefinitionRow>
      {prereqs.length ? (
        <DefinitionRow term="Before this">
          {joinElements(prereqs, ' · ', (c) => c.id, (c) => <ChapterLink chapter={c}>{label(c)} {shortTitle(c)}</ChapterLink>)}
        </DefinitionRow>
      ) : null}
      {meta.objectives?.length ? (
        <DefinitionRow className="brief-obj" term="You will be able to">
          <ul>{meta.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </DefinitionRow>
      ) : null}
      {meta.lab ? (
        <DefinitionRow term="Lab"><code>{meta.lab}</code> in the repository</DefinitionRow>
      ) : null}
    </dl>
  );
}
