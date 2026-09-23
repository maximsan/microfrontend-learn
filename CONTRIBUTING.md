# Contributing

## The evidence rule

Any claim a reasonable engineer might dispute links to a **primary source**: a spec, an RFC, official documentation, or the maintainers' own words. Quote verbatim, cite inline, and add the source to Appendix B (`content/app-b-library.mdx`). If you cannot confirm something to that standard, say so in the text and list it in Appendix C (`content/app-c-caveats.mdx`).

## Writing a chapter

A chapter is one `.mdx` file in `content/`. Its position in the file order decides its number, so moving a chapter only means renaming the file.

```mdx
---
id: "streaming"                       # stable slug; used in links and cross-references
part: "Part II · The machinery"       # sidebar group (consecutive chapters with the same part are grouped)
section: "The machinery"              # shown after the number: "Module 09 · The machinery"
title: "Fragment streaming and hydration"
nav: "Fragment streaming"             # optional shorter sidebar label
standfirst: "One sentence under the title."
prereqs: ["rendering-modes"]          # chapter ids, shown in the module brief
lab: "labs/09-streaming/"             # optional
objectives:
  - "Three things the reader can do afterwards"
appendix: true                        # appendices only
---
```

Every module ends with a `<Recap>` and a `<Check>`; `npm run check` enforces it.

## Components

All of these are available in every `.mdx` file without importing.

| Component | Use it for |
| --- | --- |
| `<Insight title="…">` | The author's analysis, a point worth remembering |
| `<Trap title="…">` | A mistake that is easy to make, and the fix |
| `<Source>` + `<Quote>` + `<Cite>` | A verbatim quote from a primary source, ending with its link |
| `<Moved title="…">` | Something that changed recently; older material gets it wrong |
| `<Recap>` | End-of-module bullet list |
| `<Check>` + `<Answers>` | Numbered questions, then collapsed numbered answers |
| `<Mod to="id" />` | Cross-reference: renders a linked "Module 07" / "Appendix C". `num` for just the number, `title` to add the title. An unknown id fails the build |
| `<Mods to={["a","b"]} />` | A comma-separated list of linked module numbers |
| `<Ok>`, `<No>`, `<Warn>` | Colour a whole table cell: `| <Ok>Yes</Ok> |` |
| `<Sub>` | Muted second line inside a table cell |
| `<Rev kind="oneway\|costly\|cheap" />` | Reversibility marker |
| `<Badge kind="live\|dead\|spec">`, `<Src>` | Reference-library entries |
| `<Flow>`, `<Box kind="good\|hot" title>`, `<Arrow sym>`, `<FlowCaption>` | Request flows. More than three boxes stack vertically |
| `<Wire>`, `<Step t="…" server rev="cheap">` | Step-by-step sequences |
| `<Tree q>`, `<Branch chip label q>`, `<Leaf chip label side why>` | Decision trees |
| `<Spectrum>`, `<Point pos side>` | The server-to-client axis |
| `<Timeline>`, `<Era yr dir title>` | History |
| `<Acronyms>`, `<Acro term>`, `<Glossary>`, `<Term name>`, `<RefGroup title>` | Back matter |
| `<Table>` | A hand-written JSX table, needed only when rows have `<th>` headers |

Code blocks take their frame from the fence's info string:

````mdx
```js file="apps/cart/webpack.config.js" label="Remote — exposes" warn={[18]}
…
```
````

`warn` highlights the lines that are the trap. Comments are dimmed automatically.

Tables are plain Markdown. On phones, tables with three or more columns turn into one labelled card per row, so write header cells that make sense as labels.

## Labs

A lab lives in `labs/NN-name/`, with the number matching its chapter at the time it was written. It has a `README.md` (goal, run, observe, break, fix, tests, check your understanding), a `starter/`, and a `solution/` that contains **only the files that change**.

Every exercise needs a test that **fails on the starter and passes on the solution**:

- Prefer a Node test (`test/*.test.mjs`, `node --test`) when the behaviour is visible over HTTP or in build output.
- Otherwise add a Playwright test (`test/*.spec.mjs`), which drives a real browser. Name its groups `observe` (platform behaviour, green on both variants) and `exercise` (red until solved).
- Tests read `LAB_VARIANT` (`starter` | `solution`, default `solution`) and start the lab's servers themselves through the exported `start({ variant })`.

Check both directions before merging: `npm run test:browser` must be all green, and `npm run test:browser:starter` must fail every `exercise` test. Prefer Node built-ins; add a dependency only when the lab is *about* it.

## Git conventions

**Branches: [trunk-based development](https://trunkbaseddevelopment.com/).** `main` is the only long-lived branch; there is no `develop`.

- Cut a short-lived branch from `main`, named after its commit type: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `test/<topic>`, `chore/<topic>`.
- Keep it small and merge it back into `main` as soon as it is reviewed and green, then delete it.
- A release is a tag `vX.Y.Z` on `main`. The branch that ships it bumps `package.json` and adds the `CHANGELOG.md` entry.

**Commits: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).** One logical change per commit.

```
type(scope): imperative summary, lower case, no full stop

Body: why the change was needed and anything a reviewer would not see
from the diff. Wrap at 72 characters.
```

| Type | For |
| --- | --- |
| `feat` | New capability: a component, a lab, a chapter section that did not exist |
| `fix` | Something was wrong: a broken sample, a false claim, a bad cross-reference |
| `docs` | Content additions and edits that are not corrections |
| `refactor` | Restructuring without changing what the reader gets |
| `style` | Visual or CSS-only changes |
| `test`, `build`, `chore` | Tests, tooling, housekeeping |

Scopes in use: `ch04`…`ch17` for chapters, `appendix-c`, `glossary`, `part-1`…`part-4`, `components`, `layout`, `client`, `labs`, `capstone`, `diagrams`, `mobile`, `nav`, `tools`.

**Before merging into `main`:**

1. Run `npm run check` and, if you touched labs or the capstone, `npm run test:labs`, `npm run test:browser` and `npm run test:browser:starter`.
2. Get two independent reviews of `git diff main...<branch>`. The reviewers do not see each other's findings; the branch author reconciles them, fixes what is real on the same branch, and records what was rejected and why.
3. Merge only with the maintainer's explicit approval.
