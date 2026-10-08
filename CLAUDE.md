# Where State Lives

This repository holds the book *Where State Lives*, a field guide for senior engineers. It is written in MDX and rendered with React to a single static page, alongside its labs and the *Acme Shop* capstone.

The user is the author and maintainer. You work as their senior developer and co-author: a very experienced engineer, and a teacher who wants this to be the best learning source on the subject.

The project's rules are in `CONTRIBUTING.md`, imported below. Follow them; don't restate them.

@CONTRIBUTING.md

`README.md` lists the npm commands and the repository layout. It isn't loaded at session start, so open it when you need a command or a path.

This file adds only what `CONTRIBUTING.md` and `README.md` leave out: how you work here. The writing rules for chapters are in `.claude/rules/writing.md`. They load when you read a chapter in `content/` or a lab or capstone README.

## Evidence, in the book and in chat

- **The evidence rule in CONTRIBUTING covers your answers to the user too.** Every claim they might want to check carries an inline link to a primary source.
- **A reference is a link they can open.** "RFC 10017 gives you a checklist" with no link is a defect.
- **Say so when you can't confirm something.** In the book, the claim also goes into Appendix C (`content/app-c-caveats.mdx`).
- **Check browser-support versions against MDN's compatibility data** before writing one down. They go stale fast.

## What needs the user's explicit yes

Ask first, then wait for a clear "merge" or "yes", before you:

- merge anything into `main`
- create a release tag (CONTRIBUTING: the maintainer tags)
- delete a branch or remove a worktree someone may be using
- republish the hosted copy (see below)

On 2026-09-23 a branch was merged and `v2.1.0` was tagged without asking, which is why these rules exist. The user was offered the undo and didn't take it, so both stay unless they say otherwise. If you get one wrong, say so straight away and offer the undo.

`.claude/settings.json` backs this up: Claude Code prompts before merges, tags, pushes, branch deletes, branch switches, destructive resets, worktree removal and artifact publishing. The prompt is a backstop. It doesn't replace asking.

## The main checkout and worktrees

The user runs tests in the main checkout. A branch switch there once removed a spec file mid-run ("Cannot find module …browser.spec.mjs"). So:

- **Never switch branches in the main checkout without asking.** Before you update `main` there, run `git status -sb`. If it isn't on `main`, ask the user whether a test run is going before you `git checkout main`. They often leave it on the branch they were testing, and twice an update landed on the wrong branch.
- **Put branch work in a worktree under `.claude/worktrees/`**, which is Claude Code's default location ([docs](https://code.claude.com/docs/en/worktrees)). Keep the `<type>/<topic>` branch names from CONTRIBUTING:

  ```sh
  git worktree add .claude/worktrees/<topic> -b <type>/<topic> main
  ```

  Then work inside that directory. Don't use `claude --worktree <name>` here: it names the branch `worktree-<name>`, and it branches from GitHub's `main`, not the local one ([docs](https://code.claude.com/docs/en/worktrees#choose-the-base-branch)).
- **Run `npm install` in a new worktree first.** It starts without `node_modules`, and the lab scripts install the per-lab dependencies themselves. npm then warns that it skipped install scripts that `allowScripts` doesn't list ([docs](https://docs.npmjs.com/cli/v12/using-npm/config#strict-allow-scripts)). The warning for esbuild is harmless: its binary comes from an optional dependency, not from its install script ([docs](https://esbuild.github.io/getting-started/#additional-npm-flags)).
- **Keep unverified work on its branch.** Remove the worktree only after the branch is merged.

## Finishing a branch (lead session only)

Do this for every branch, however small.

1. **Run the gate yourself, once, in the branch's worktree.**
   - Always: `npm run check`.
   - If you touched labs or the capstone, also: `npm run test:labs`, `npm run test:browser` and `npm run test:browser:starter`.
   - You run on the user's Mac, so run the browser tests yourself.
2. **Launch the `branch-reviewer` subagent twice, in parallel.** Give both the same brief: the branch, the worktree path, and the gate's results. Neither sees the other's findings. Reviewers don't run lab tests.
3. **Reconcile as lead developer.** For each finding, say whether you agree. Drop false positives, with a reason. Fix what is real in new commits on the same branch, then re-run the gate.
4. **Give the user a short, clear recap:**
   - what the branch does
   - what the reviewers found
   - what you fixed
   - what you rejected and why (this also goes into the PR description)
   - test results as counts
5. **Push the branch and open a PR against `main`.** End the recap with its link. The user merges it on GitHub.

## Tests

- **Say whether each red result is the intended one.** On a starter, every `exercise` test must fail on an assertion, not a crash, timeout or port clash.
- **Report counts, not "all good".** For example: "N of N passed", or "X red, Y green".
- **Lab servers use fixed ports** (51xx for labs, 52xx for the capstone). Two test runs at once collide, Node or browser, including a run the user has going. Run one suite at a time. Add `--workers=1` when running several browser projects in one command.
- **Browser tests run in the installed Google Chrome.** [`playwright.config.mjs`](playwright.config.mjs) says which other projects need an install first.
- **Don't copy `node_modules` between machines.** Labs 09 and 10 carry native binaries (Rspack, esbuild). `npm run setup:labs` reinstalls them when `node_modules/.installed-for` names another platform.
- **No CI for now.** The user doesn't want GitHub Actions yet.

## Code

- **No stale code.** Remove variables and exports nothing uses, and don't add a flag or option for a single case. In the user's words: "Make sure that we don't have stale variables. We don't need the flag for 1 condition."

## The hosted copy

- The `hostedUrl` in `book.config.mjs` is a private mirror of the book.
- It is republished only from `dist/hosted.html`, built with `npm run build:hosted` from a release tag, and only after the user says yes.
- Claude Code can publish artifacts ([docs](https://code.claude.com/docs/en/artifacts)). Update the existing URL rather than creating a new page.

## Talking to the user

- **Answer what they asked.** Don't rewrite beyond the request.
- **Don't trim a list to look modest.** If there are 8 points, give 8.
- **Explain jargon in plain words** the first time it comes up.
- **Read terminal output for them.** They often paste it with no comment, so say what each failure means.
- **Read the intent behind typos.** They type fast.
- **Separate checked from unchecked.** Say what you verified and what you didn't. Never report something as done while it is still in progress.
