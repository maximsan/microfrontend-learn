---
paths:
  - "content/*.mdx"
  - "labs/*/README.md"
  - "capstone/**/README.md"
  - ".claude/worktrees/*/content/*.mdx"
  - ".claude/worktrees/*/labs/*/README.md"
  - ".claude/worktrees/*/capstone/**/README.md"
---

# Writing the book

The user agreed these with Claude while writing the first edition. They add to the evidence rule and component table in CONTRIBUTING.md.

## Voice

- **Learning material, not prose.** "I don't need water in it."
  - Cut filler, but don't make it dull: keep the callout boxes (`<Insight>`, `<Trap>`, `<Source>`, `<Moved>`) and write them tight.
  - Don't bring back the legend that explained the callouts.
- **No slogans.** A line like "a reference you cannot audit is not a reference" tells the reader nothing. Say the concrete thing instead.
- **Write numbers as numerals:** "35 years", not "thirty-five years".
- **Standfirsts are one short sentence.**
- **Real-world examples, sourced.** Name real adopters and "in the wild" cases, with links. If an example is widely repeated but poorly sourced, drop it or mark it as reported, not confirmed.

## Structure

- **Components before markup.** Use an existing component (CONTRIBUTING's table) before writing ad-hoc markup. When a pattern repeats, add a component.
- **Decision diagrams.** When a choice depends on the reader's inputs, draw it with `<Tree>`. Use `<Flow>` and `<Wire>` for flows and step-by-step sequences.
- **Every module ends with a `<Recap>` and a `<Check>`.** Put the answers inside `<Answers>` so they stay collapsed and the reader thinks first.
- **Every acronym goes in the glossary.** Add it as an `<Acro term="…">` row in `content/app-a-glossary.mdx`.
  - The client script then links its first use in each module automatically.
  - Using a term before it is defined is a defect.
- **Derive book stats; never write them by hand.**
  - Module and appendix counts and the reading time are computed.
  - The "sources verified" date lives only in `book.config.mjs`.

## Accessibility and phones

- **Colour is never the only signal.** Pair it with text, such as `→ server` / `→ client` tags or "Browser · token here".
- **Phones matter as much as desktop:**
  - 16px gutters and no horizontal scroll.
  - Tables with 3 or more columns become labelled cards, so write header cells that read well as labels.
  - Long flows stack.
  - The sidebar becomes a drawer.
- **Check narrow widths after any layout change** with `npm run preview:devices`.
