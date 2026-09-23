# Lab 09 · Streaming SSR on the wire

**Book:** *Fragment streaming and hydration* (and *Rendering modes*)  
**Time:** 40 minutes  
**You need:** Node 20+, a browser, and `npm install` in this folder (React 19 and esbuild).

You will watch one HTTP response arrive in pieces, see a later piece repair an earlier one, then fix the two failures the chapter says composed pages suffer most: a time-zone hydration mismatch and one fragment's error blanking the page.

```sh
cd labs/09-streaming
npm install
npm start            # starter  → http://localhost:5109
npm run solution     # reference fix
npm test             # checks the solution; LAB_VARIANT=starter npm test checks your copy
```

The page has a shell (header), a **post** that takes 1.5 s to load, and a **sidebar** that takes 0.4 s, even though the sidebar comes *after* the post in the markup.

## 1 · Watch the wire

With the server running, in a second terminal:

```sh
npm run wire
```

You will see three chunks of **one** response:

1. **~0 ms**, the shell: `<html>`, the header, and both `Loading…` fallbacks. The browser can paint now.
2. **~400 ms**, the sidebar: `<div hidden id="S:1">…</div>` followed by an inline `<script>` defining and calling `$RC(…)`.
3. **~1500 ms**, the post, the same way, and then the response closes.

The sidebar arrived first although it is later in the markup: **order of completion, not order of markup**. Open the page in the browser with DevTools → Network → *Disable cache*, and watch the sidebar pop in before the post.

Read the `$RC` script in chunk 2. Since React 19.2 it does not swap each block in immediately. It queues reveals (`$RB`) and flushes them on an animation frame, so blocks that arrive close together appear together. That is a change from the React 18 description the chapter quotes.

`npm test` asserts all three of these properties against a live server.

## 2 · Break: the time-zone mismatch

The server deliberately runs in **UTC**. The header's `<Published>` formats a date with the runtime's own time zone.

1. Open the page and the console. Unless your machine is on UTC, you get a hydration error: the server said `21:30`, your browser rendered something else, and React threw away the server's HTML for that part of the tree.
2. If you *are* on UTC, use Chrome DevTools → ⋮ → More tools → *Sensors* → *Location* → *Tokyo* (it changes the time zone too), then reload.

This is invisible to a developer who sits in the same zone as the server, which is why it is the most common production mismatch.

**Fix** `starter/Published.jsx` so the first render is the same everywhere, and the reader still ends up seeing local time. Run `LAB_VARIANT=starter npm test`: the time-zone test fails until you do.

<details>
<summary>Hint</summary>

Render the first pass in an explicit zone (`timeZone: 'UTC'`, labelled as such), then switch to the reader's zone in `useEffect`. Effects never run on the server, so they cannot cause a mismatch. In a composed page, the alternative is to resolve the zone once in the shell and pass it to every fragment.
</details>

## 3 · Break: one fragment takes down the page

Open <http://localhost:5109/?boom>. The sidebar throws, but only in the browser, as if the sidebar team shipped a client-only bug. The whole page goes blank, including the post and header that rendered perfectly.

**Fix** it in `starter/App.jsx` so a failing fragment shows a small fallback and everything else survives. Compare with `solution/App.jsx` and `solution/ErrorBoundary.jsx`.

This lab keeps one React root and contains failures with per-fragment error boundaries. When fragments belong to *different teams with different deploys*, the chapter goes further: give each fragment its own `hydrateRoot` with a distinct `identifierPrefix`, so they do not even share a React tree.

## Tests

4 Node tests + 3 browser tests. On the starter the time-zone tests (Node and browser) and the crash test fail; the wire and observation tests pass on both.

```sh
# from the repository root, once:  npm install   (and Google Chrome, or: npx playwright install chromium)
LAB_VARIANT=starter npx playwright test labs/09-streaming --project=chrome   # your copy: red until you finish
npx playwright test labs/09-streaming --project=chrome                       # the reference: green
```

The Node tests run from this folder with `LAB_VARIANT=starter npm test` (yours) or `npm test` (reference).

Tests named *observe* describe the platform and pass on both. Tests named *exercise* are the ones you turn green.

## Check your understanding

- Why can a crawler read the full post even if `/client.js` never loads?
- The scope `Map` passed to `<App>` is created per request in `server.mjs`. What would go wrong if it were a module-level variable instead? (*Sessions, CSRF and authorization* calls this the highest-severity bug in the guide.)
