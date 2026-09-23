// The whole book page: top bar, sidebar, hero and one <section> per chapter.
import { TopBar } from './TopBar.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Hero } from './Hero.jsx';
import { Chapter } from './Chapter.jsx';

/**
 * @param {{ hero: JSX.Element, chapters: { meta: object, body: JSX.Element }[], stats: object }} props
 */
export function Page({ hero, chapters, stats }) {
  return (
    <>
      <TopBar firstId={chapters[0]?.meta.id} />
      <div id="shell">
        <Sidebar chapters={chapters} />
        <main>
          <Hero stats={stats}>{hero}</Hero>
          {chapters.map(({ meta, body }, i) => (
            <Chapter key={meta.id} meta={meta} prev={chapters[i - 1]?.meta} next={chapters[i + 1]?.meta}>
              {body}
            </Chapter>
          ))}
        </main>
      </div>
    </>
  );
}
