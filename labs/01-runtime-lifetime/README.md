# Lab 01 · Runtime lifetime

**Book:** *The dividing line*  
**Time:** about 20 minutes  
**You need:** Node 20+ and a desktop browser. No `npm install`.

You will see, on screen, whether the JavaScript runtime survives each kind of interaction. Then you will reproduce the leak that catches out hypermedia apps (htmx, Turbo) and fix it.

## Run

```sh
node labs/01-runtime-lifetime/server.mjs                   # your working copy (starter/)
VARIANT=solution node labs/01-runtime-lifetime/server.mjs  # the reference fix
```

Open <http://localhost:5101>. Every page shows a badge with a **runtime id** (random, created once per JavaScript runtime), how long that runtime has been **alive**, and a click counter kept **only in memory**.

## 1 · Observe: the MPA

1. Open **MPA**. Click the button three times.
2. Follow the link to page B.

The runtime id changes, the age restarts at zero, and the clicks are gone. A link in an MPA is a document replacement: heap, variables and closures are all discarded.

## 2 · Observe: the SPA

1. Open **SPA**. Click the button three times.
2. Move between *Home*, *User 42* and *Settings*.

Same id, the age keeps growing, and the clicks survive. Navigation here is `history.pushState()` plus a render call. Notice that the code renders straight after `pushState`: `pushState` fires no event (see *Location, history, URL*).

## 3 · Observe: bfcache blurs the line

1. In the MPA, go from page A to page B, then press the browser's **Back** button.
2. The page says *restored from bfcache*: the old runtime id and clicks are back. The browser froze the whole heap and thawed it.
3. Now follow **…with an unload handler** (page B, this time registering an `unload` listener), click *Go to page A*, then press Back. Page B says *fresh load*: one `unload` listener made it ineligible.

In Chrome, *DevTools → Application → Back/forward cache → Test* shows the reason in plain words.

## 4 · Break: the fragment-swap leak

1. Open **Fragment swap** and press *Swap in a new fragment* five times.
2. Only one clock is on screen, but **Timers running right now** says 5.

The document never reloaded, so the runtime is long-lived, but each swap destroyed the DOM the timer was writing to. The intervals outlived their targets. Leave it for a minute and open *DevTools → Performance monitor*: the work never stops.

## 5 · Fix it

Edit `starter/swap/app.js` so that swapping a fragment tears down whatever the old fragment started. The counter should stay at **1** however many times you swap.

<details>
<summary>Hint</summary>

Give every fragment a lifecycle. Create an `AbortController` in `hydrate()`, register a cleanup for each interval on its `signal`, return it, and call `abort()` on the old one before replacing `slot.innerHTML`. Stimulus's `disconnect()`, htmx's `htmx:beforeCleanupElement` and single-spa's `unmount()` all exist for this reason.
</details>

Compare with `solution/swap/app.js`, or run the server with `VARIANT=solution`.

## Tests

3 browser tests. The timer test fails until part 5 is fixed; the two observation tests pass on both.

```sh
# from the repository root, once:  npm install   (and Google Chrome, or: npx playwright install chromium)
VARIANT=starter npx playwright test labs/01-runtime-lifetime --project=chrome       # your copy: red until you finish
npx playwright test labs/01-runtime-lifetime --project=chrome                       # the reference: green
```

Tests named *observe* describe the platform and pass on both. Tests named *exercise* are the ones you turn green.

## Check your understanding

- The fragment-swap page is often described as having “no client state”. Which part of that is true, and which part did step 4 disprove?
- Users on phones lose unsaved SPA work after leaving the tab overnight. The OS discarded the tab. Which page in this lab loses its clicks the same way, and what would have to change for the work to survive?
