# Lab 10 · Module Federation, and where React comes from

**Book:** *Bundlers and Module Federation* (and *Micro-frontends*)  
**Time:** 45 minutes  
**You need:** Node 20+, a browser, and `npm install` in this folder (Rspack 1.x, React 19).

Two teams, two builds, two origins: the **shell** (host, port 5110) loads a **cart** widget (remote, port 5111) at runtime. The starter has the three mistakes the chapter warns about. You will find each one, prove it with a test, and fix it.

```sh
cd labs/10-federation
npm install
npm start               # build the starter and serve both apps
npm run solution        # build and serve the reference fix
LAB_VARIANT=starter npm test   # checks your copy (fails until you fix parts 1–2)
npm test                       # checks the solution
```

`npm start` copies `starter/` into `.build/starter/`, builds both apps with Rspack, then serves them. Re-run it after every change.

## 1 · The remote brings its own React

Open <http://localhost:5110>. The page is blank. The console shows **Invalid hook call** (open the console before the page loads).

Look at `starter/cart/rspack.config.mjs`: it exposes `./CartWidget` but declares no `shared` dependencies. So the cart bundles its **own** React, and `useState` inside `CartWidget` runs against that copy while the shell's React DOM renders it. React's own documentation describes the exact condition: it only breaks if `require('react')` resolves differently for a component and for the `react-dom` that rendered it.

**Fix:** declare `react` and `react-dom` as singletons in the cart with the same ranges as the shell. Rebuild. The widget renders, and its footnote says *shared with the shell*: it is using the very same `useState` function as the host.

Test 1 inspects the build and checks that the cart **consumes** React from the share scope instead of bundling it.

## 2 · The subpath nobody shares

The shell shares `react-dom`, but `bootstrap.jsx` imports `createRoot` from **`react-dom/client`**, which is a different module id. Test 2 fails because the shell bundles `react-dom/client` itself.

Here the cart never renders a root of its own, so the page works, which is exactly why this goes unnoticed. The moment a remote calls `createRoot` or `hydrateRoot` (standalone mode, a portal root, a second fragment), there are two React DOMs on the page, and the Module Federation docs warn this breaks singleton requirements and hydration.

**Fix:** add the trailing-slash key `'react-dom/': { singleton: true }` to **both** configs. It shares every `react-dom/*` subpath. Run the tests again: test 2 lists `react-dom/client` among the consumed modules.

## 3 · The remote is down

Stop the servers, then start only the shell:

```sh
node build.mjs && node serve.mjs --no-cart
```

The `import('cart/CartWidget')` rejects, nothing catches it, and the shell's whole tree unmounts, taking the shell team's page down for the cart team's outage.

**Fix** `starter/shell/src/App.jsx` so an unavailable remote shows a small fallback and the rest of the page stays. Compare with `solution/shell/src/App.jsx` and its `RemoteBoundary.jsx`.

## Tests

2 Node tests + 2 browser tests. All four fail on the starter; the Node tests read the build, the browser tests run it.

```sh
# from the repository root, once:  npm install   (and Google Chrome, or: npx playwright install chromium)
LAB_VARIANT=starter npx playwright test labs/10-federation --project=chrome   # your copy: red until you finish
npx playwright test labs/10-federation --project=chrome                       # the reference: green
```

The Node tests run from this folder with `LAB_VARIANT=starter npm test` (yours) or `npm test` (reference).

Tests named *observe* describe the platform and pass on both. Tests named *exercise* are the ones you turn green.

## Check your understanding

- Why does `index.js` only contain `import('./bootstrap.jsx')`? What error do you get if you move the `createRoot` call into `index.js`?
- Both apps now share React as a singleton. Which team has just become coupled to which, and what happens the day the shell wants React 20 and the cart does not?
- Swap `@rspack/core`'s `container.ModuleFederationPlugin` for webpack's. What changes? (Nothing but the import; that is the point the chapter makes about Rspack being a drop-in.)
