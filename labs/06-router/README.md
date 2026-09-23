# Lab 06 · A router that does what the browser did

**Book:** *Location, history, URL*  
**Time:** 30–40 minutes  
**You need:** Node 20+ and a current Chrome, Edge, Firefox or Safari (the Navigation API has been Baseline since January 2026). No `npm install`.

The starter is a typical `pushState` router. It looks fine with a mouse. You will measure what it breaks for keyboard and screen-reader users, then rebuild it on the Navigation API.

## Run

```sh
node labs/06-router/server.mjs             # your working copy (starter/)
node labs/06-router/server.mjs --solution  # the reference router
```

Open <http://localhost:5106>. The **self-check** panel in the corner re-tests four things after every navigation.

## 1 · Measure what is broken

1. Scroll halfway down *Home*, then click **Orders**.
2. Read the self-check panel: expect four ❌.
3. Now use only the keyboard. Press <kbd>Tab</kbd> to reach *Order 1042* and press <kbd>Enter</kbd>, then press <kbd>Tab</kbd> once more. Focus never left the nav link, so it moves to *Settings* rather than into the order you just opened.
4. If you have a screen reader (VoiceOver: <kbd>⌘</kbd> <kbd>F5</kbd>; NVDA on Windows), repeat: nothing tells you the page changed.

These are the four things a real document navigation does automatically:

| The browser does | A client router must |
| --- | --- |
| Moves focus to the new document | Move focus to the new view's `<h1>` (`tabindex="-1"`) |
| Announces the new page | Write the page name into an `aria-live="polite"` region |
| Updates the title | Set `document.title` |
| Resets or restores scroll | Top of page on a new navigation, saved position on Back |

## 2 · Rebuild on the Navigation API

Rewrite `starter/router.js`:

- Replace the click listener and `popstate` with one `navigation.addEventListener('navigate', …)`. It fires for link clicks, form submissions, Back/Forward and programmatic navigation alike, which is what `pushState` never gave you.
- Skip what you should not handle: `!event.canIntercept`, `event.hashChange`, downloads and other origins.
- Call `event.intercept({ handler, focusReset, scroll })`. Decide whether to let the platform reset focus or to do it yourself so it lands on the `<h1>`.
- Do the other three duties inside your render function.
- Remember that `navigate` does **not** fire for the first page load.

Keep going until the panel shows four ✅ on every route, including after Back and Forward.

<details>
<summary>Hint: scroll</summary>

`scroll: 'after-transition'` scrolls to the top after your handler resolves on a new navigation, and restores the previous position on traversal. You no longer need `history.scrollRestoration = 'manual'`.
</details>

Compare with `solution/router.js`.

## 3 · Stretch: two routers, one address bar

Add a second, independent router for a widget, for example one that keeps a `?tab=` parameter in sync, and give it its own `pushState` calls. Watch Back take two presses to leave a page: two routers pushed two entries. Then fix it by giving the widget the current URL as input and letting the page router own history. This is the micro-frontend rule from the chapter in miniature: **one router owns history per document; everyone else receives the path.**

## Tests

5 browser tests. All five fail on the starter; each turns green as your router takes over one of the four duties, and Back.

```sh
# from the repository root, once:  npm install   (and Google Chrome, or: npx playwright install chromium)
LAB_VARIANT=starter npx playwright test labs/06-router --project=chrome   # your copy: red until you finish
npx playwright test labs/06-router --project=chrome                       # the reference: green
```

Tests named *observe* describe the platform and pass on both. Tests named *exercise* are the ones you turn green.

## Check your understanding

- Why did every micro-frontend framework patch `history.pushState`, and why does a shell built on the `navigate` event not need to?
- Your self-check passes on click navigation but fails after pressing Back. Which option to `intercept()` did you get wrong?
