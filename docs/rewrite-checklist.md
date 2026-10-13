# Chapter rewrite checklist

Every chapter is being rewritten so that a person can follow it on the first read. Each chapter gets its own branch and pull request. This file tracks which chapters are done, and the problems to look for in each one. The rules themselves live in [`.claude/rules/writing.md`](../.claude/rules/writing.md) and [CONTRIBUTING](../CONTRIBUTING.md). Delete this file when the last chapter is merged.

## What every rewrite covers

1. **Prose:** the Voice section of `writing.md`, and CONTRIBUTING's evidence rule.
2. **Sources:** every link in the chapter is also listed in Appendix B.
3. **Self-check:** the numbered list and `<Answers>` become a test, as in the `<Check>` rule of `writing.md`.
4. **Code:** the Code snippets section of `writing.md`.
5. **Review:** CONTRIBUTING, "Before merging into `main`".

## Problems in the old text

Each of these was in Chapter 1 before its rewrite. Look for the same kind of problem in every other chapter.

- **An API described by the wrong role.** The old text offered `htmx:load` as the answer to leaking timers. It is a set-up hook; the clean-up hook is `htmx:beforeCleanupElement`. Check every API named in passing against its docs.
- **A claim tied to the wrong unit.** The old text said LiveView and Blazor Server keep "one process or circuit per open WebSocket". Blazor's docs say a circuit is not tied to one connection. Check what each source counts per.
- **Absolute claims the source does not make.** The old text said "every interaction costs a round trip" and that bfcache's chapter "has the mechanics". Only server-handled events cost a round trip, and that chapter lists two rules.
- **Answers that repeat a loose claim.** An answer said listeners and intervals "keep running". Only timers keep running; listeners stay registered. Re-check the answers against the corrected text before turning them into questions.
- **Code described but not shown.** The chapter named `setInterval`, `addEventListener`, `disconnect()` and `htmx:load`, but never showed how they fit together.
- **Sources missing from Appendix B.** Links already in the chapter had never been added.

## Mistakes the rewrite itself made

The first drafts of Chapter 1's rewrite introduced these. Reviews caught them. Check new prose for them.

- **Coined terms.** "One slot per connection" appeared in no source. Use the source's own words.
- **Summaries that claim more than the text.** A new opening said runtime lifetime causes "most of the topics this book covers".
- **A snippet tested on one input only.** The htmx example missed a clock that is the top element of a fragment, because the test fragment wrapped its clock. Test each snippet's edge cases, not only the happy path.

## Status

| File | Status | Notes |
| --- | --- | --- |
| `00-how-to-use.mdx` | Not started | No self-check, by design |
| `01-dividing-line.mdx` | Rewritten, in review | Branch `feat/ch01-rewrite-and-quiz` |
| `02-spectrum.mdx` | Not started | |
| `03-how-we-got-here.mdx` | Not started | |
| `04-rendering-modes.mdx` | Not started | |
| `05-choosing.mdx` | Not started | |
| `06-navigation.mdx` | Not started | |
| `07-micro-frontends.mdx` | Not started | |
| `08-sharing.mdx` | Not started | |
| `09-streaming.mdx` | Not started | |
| `10-federation.mdx` | Not started | Has code blocks, none tested yet |
| `11-transports.mdx` | Not started | Has a code block, not tested yet |
| `12-auth.mdx` | Not started | |
| `13-sessions.mdx` | Not started | |
| `14-delivery.mdx` | Not started | |
| `15-synthesis.mdx` | Not started | |
| `16-migration.mdx` | Not started | |
| `17-capstone.mdx` | Not started | |
| `app-a-glossary.mdx` to `app-d-counterarguments.mdx` | Not started | Prose and sources only |
