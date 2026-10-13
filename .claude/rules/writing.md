---
paths:
  - "content/*.mdx"
  - "labs/README.md"
  - "labs/*/README.md"
  - "capstone/**/README.md"
  - ".claude/worktrees/*/content/*.mdx"
  - ".claude/worktrees/*/labs/README.md"
  - ".claude/worktrees/*/labs/*/README.md"
  - ".claude/worktrees/*/capstone/**/README.md"
---

# Writing the book

## Voice

- **Tight.** This is learning material, and the user's words are "I don't need water in it."
  - Cut filler without making it dull. Keep the callout boxes (`<Insight>`, `<Trap>`, `<Source>`, `<Moved>`), and write them as tight as the text around them.
- **Plain sentences.** Keep sentences short, with one fact each. No asides between dashes or in parentheses. Explain every term the first time it appears.
- **Headings say what the section covers.** No slogans such as "the sneaky case".
- **Rewording keeps the claim.** When you rewrite a passage, its claims must not widen, narrow or change. A new claim needs a primary source.
- **Concrete claims, not aphorisms.** Replace a quotable line like "a reference you cannot audit is not a reference" with the concrete fact behind it.
- **Write numbers as numerals:** "35 years", not "thirty-five years".
- **Standfirsts are one short sentence.**
- **Real-world examples, sourced.** Name real adopters and "in the wild" cases, with links. If an example is widely repeated but poorly sourced, drop it or mark it as reported, not confirmed.

## Structure

- **Components before markup.** Use an existing component (CONTRIBUTING's table) before writing ad-hoc markup. When a pattern repeats, add a component.
- **Decision diagrams.** When a choice depends on the reader's inputs, draw it with `<Tree>`. Use `<Flow>` and `<Wire>` for flows and step-by-step sequences.
- **A `<Check>` is a test**, built from `<Question>`, `<Option>` and `<Why>`. A chapter not yet rewritten keeps its numbered list and `<Answers>`.
  - All questions follow one scenario from the reader's work, so they read as connected.
  - Every option has a `<Why>`. Wrong options are real misconceptions, not filler.
  - Options are full sentences of similar length. The correct option is never the only longest.
- **Every acronym goes in the glossary.** Add it as an `<Acro term="…">` row in `content/app-a-glossary.mdx`.
  - The client script then links its first use in each module automatically.
  - Using a term before it is defined is a defect.
- **Derive book stats; never write them by hand.**
  - Module and appendix counts and the reading time are computed.
  - The "sources verified" date lives only in `book.config.mjs`.

## Code snippets

- **Every snippet runs.** Test it in a browser or with Node before it goes in. Then compare the book's text with the tested code.
- **Every snippet is real.** It comes from official docs, a lab or the capstone, and the text says where. A snippet written for the book names the documented APIs it uses.
- **No two snippets show the same thing.** When a "before" and an "after" differ by a few lines, show only the "after" and say what the missing lines would cause.
- **Show the code the text describes.** If a passage explains how code fits together, add a short snippet.

## Accessibility and phones

- **Colour is never the only signal.** Pair it with text, such as `→ server` / `→ client` tags or "Browser · token here".
- **Phones matter as much as desktop:**
  - 16px gutters and no horizontal scroll.
  - Long flows stack.
  - The sidebar becomes a drawer.
- **Check narrow widths after any layout change** with `npm run preview:devices`.
