# Where State Lives

*Web architecture from documents to micro-frontends, with every claim sourced.*

A field guide for senior engineers. It has 18 modules in four parts, from what actually separates a SPA from an MPA, through rendering modes, routing, micro-frontend composition, streaming, federation, transports, auth and delivery, to decision trees, migration paths and a capstone. Every module has a recap and a self-check, and most have a hands-on lab.

## Read it

```sh
npm install
npm run build        # → dist/index.html, a single self-contained page
open dist/index.html
```

`npm run watch` rebuilds on every change. The page works offline except for web fonts, adapts from phones to wide screens, and prints cleanly.

## Do the labs

| | |
| --- | --- |
| [`labs/`](labs/) | Six labs that reproduce a chapter's traps on your machine and fix them, most with tests |
| [`capstone/`](capstone/) | *Acme Shop*: five services behind one origin, with 22 acceptance tests you can also run against your own rebuild |

`npm run test:labs` runs every lab's tests and the capstone's.

## Repository layout

```
book.config.mjs        title, tagline, "sources verified" date
content/               one .mdx file per chapter; file order = chapter order
  00-how-to-use.mdx …  modules (numbered automatically from file order)
  app-a-glossary.mdx … appendices (lettered automatically)
  _hero.mdx            the introduction on the title screen
src/
  components/          the MDX component library (callouts, tables, diagrams, cross-references…)
  layout/Page.jsx      sidebar, hero, module brief, previous/next
  styles/book.css      all styles, light and dark
  client/book.js       the only JavaScript the reader runs (no React in the browser)
  mdx/                 rehype plugins
scripts/               build, check, test-labs
labs/  capstone/       hands-on material
tools/devices.html     preview the build at several widths side by side
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Writes `dist/index.html` (open locally) and `dist/artifact.html` (body-only, for republishing the hosted copy) |
| `npm run watch` | Rebuilds on change |
| `npm run check` | Build, then fail on broken in-page links, duplicate ids, or a module without recap or self-check |
| `npm run test:labs` | Every lab's and the capstone's test suite |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the authoring components, the evidence rule, and the git conventions: git-flow branches and Conventional Commits.

## Published copy

A private hosted copy lives at <https://claude.ai/artifact/VsdCpeBVajAtxf2fzov46S>. **This repository is the source of truth**; the hosted page is only ever republished from `dist/artifact.html`.
