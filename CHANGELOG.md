# Changelog

All notable changes to the book. Versions follow [Semantic Versioning](https://semver.org/) loosely: a major version is a new edition, a minor version adds chapters or labs, a patch fixes content.

## Unreleased

### Added
- `npm run preview:devices`: builds the book and opens the side-by-side width preview (moved from `tools/devices.html` to `scripts/devices.html`).

### Changed
- **One switch picks the copy you run: `VARIANT`.** `LAB_VARIANT` and `CAPSTONE_VARIANT` always meant the same thing (`starter` or `solution`), so there is now one variable for every lab and the capstone, and it replaces the `--solution` flag too: `VARIANT=starter npm test` checks your copy, `VARIANT=solution node server.mjs` runs the reference. Any other value is an error instead of silently running the wrong copy.

### Fixed
- **Capstone browser tests follow the milestones.** The M1 and M2 tests no longer sign in, so they turn green once M1 and M2 are built instead of waiting for M6. The two checks that do need a session (the session surviving a zone crossing, and the cart badge) moved to M6, which now has 5 browser tests; 10 in all.
- The account zone's router no longer paints a slow, stale view over the page the reader has already navigated to, with an M6 browser test that delays the orders response to prove it.

## 2.1.0 — 2026-09-23

### Added
- **Red-first browser tests.** 26 Playwright tests across every lab and the capstone. *Exercise* tests fail on each starter and pass on its solution; *observe* tests show platform behaviour and pass on both. Verified in Chrome on macOS: `npm run test:browser:starter` fails every exercise, `npm run test:browser` passes all 26 in about 16 s.
- **Capstone starter.** `capstone/starter/` stubs the gateway, both zones and the shared shell (each answers `501`); the other teams' services run as-is. All 22 acceptance tests and 7 browser tests start red.
- `npm run setup:labs`: installs each lab's dependencies for the current OS and CPU, and reinstalls when `node_modules` came from another platform.

### Changed
- Browser test files run in parallel (one worker per file); the Node lab suites run in parallel (about 23 s → 5.5 s).
- Failing browser actions give up after 5 s and navigations after 10 s, so a red run finishes in seconds.
- Every lab server exports `start({ variant })`.

### Fixed
- Labs 09 and 10 load their bundlers lazily, so one broken native install fails only that lab.

## 2.0.1 — 2026-09-23

### Fixed
- The single-spa sample passed an access token to every micro-frontend; it now passes the shell's CSRF accessor.
- "The shell owns token refresh" contradicted the BFF default; refresh now has one owner, the BFF.

### Changed
- `npm run build` writes only `dist/index.html`; the hosted-copy variant moved to `npm run build:hosted`.
- Lab 13's solution no longer duplicates the starter's page.

## 2.0.0 — 2026-09-23 · *Where State Lives*

A new edition of what was *The Rendering Spectrum*: rebuilt as source files, restructured, corrected, and given hands-on material.

### Added
- **Source format.** One MDX file per chapter, rendered by a React component library to a single static page; chapter numbers and cross-references are resolved at build time.
- **Chapters.** *Rendering modes* (Part I), *Sharing a surface: styles and state*, *Sessions, CSRF and authorization*, and *Capstone: Acme Shop* (Part IV).
- **Module brief** on every module (time, prerequisites, objectives, lab) and previous/next links.
- **Self-checks** with answers on every module, and a recap where one was missing.
- **Labs** for runtime lifetime, the Navigation API router, streaming SSR, Module Federation, the connection budget, and a BFF session. 15 automated tests.
- **Capstone** *Acme Shop*: zones, a shared shell, a streamed fragment with a budget, a BFF, one realtime stream, traceable builds. 22 acceptance tests.
- New material: one realtime stream per browser via Web Locks; React 19.2's batched Suspense reveals; PPR primitives in `react-dom`; the Module Federation RSC tracking issue.
- `npm run check`, `npm run test:labs`, and a device preview page.

### Changed
- Micro-frontends and auth were split along their natural seams; synthesis and migration moved into a new Part IV.
- Reading paths regenerated for the new order, plus a hands-on path.
- Appendix C's "corrections to earlier drafts" became *Common misconceptions*.
- Source quotes render as pull-quotes instead of filled boxes.
- Phones: tables with three or more columns become labelled cards, long flows stack, 16px gutters, larger touch targets, drawer focus management, copy buttons on code.

### Fixed
- The import-map sample contained a `//` comment and was invalid JSON.
- The custom-element sample called `attachShadow()` in `connectedCallback`.
- Samples pinned React 18; now React 19.
- The default stack paired routing-level zones with a runtime shell that owns history and the socket, which a zone crossing destroys.
- The state ladder recommended web storage for tokens.
- A View Transitions claim, an unsourced Module Federation/RSC claim, and several broken cross-references.

## 1.0.0 — 2026-09-22

The single-file edition as published, imported unchanged.
