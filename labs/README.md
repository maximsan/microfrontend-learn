# Labs

Hands-on exercises for the book. Each lab reproduces a trap from one chapter, makes it visible, and fixes it. Most include a `starter/` (your working copy), a `solution/` (only the files that change), and tests where the behaviour can be checked outside a browser.

| Lab | Chapter | Time | Install | Tests (red on the starter → green when solved) |
| --- | --- | --- | --- | --- |
| [01 · Runtime lifetime](01-runtime-lifetime/) | The dividing line | 20 min | none | 3 browser |
| [06 · A router that does what the browser did](06-router/) | Location, history, URL | 30–40 min | none | 5 browser |
| [09 · Streaming SSR on the wire](09-streaming/) | Fragment streaming and hydration | 40 min | `npm install` | 4 Node + 3 browser |
| [10 · Module Federation, and where React comes from](10-federation/) | Bundlers and Module Federation | 45 min | `npm install` | 2 Node + 2 browser |
| [11 · The six-connection budget](11-connection-budget/) | APIs and transports | 25 min | none | 3 browser |
| [13 · From tokens in localStorage to a BFF](13-bff-session/) | Auth architecture · Sessions · Migration paths | 60–90 min | none | 9 Node + 3 browser |
| [Capstone · Acme Shop](../capstone/) | Capstone: Acme Shop | a weekend | none | 22 Node + 10 browser |

Lab numbers match the chapter numbers at the time of writing.

## Running the tests

Every lab has a **starter** (your working copy) and a **solution** (the reference). The tests are written to fail on the starter and pass on the solution, so you can run them before you start and watch them turn green.

```sh
# from the repository root, once
npm install
# the browser tests use your installed Google Chrome; without it:
npx playwright install chromium     # then add --project=chromium instead of chrome

npm run test:browser:starter        # every lab's starter and the capstone starter: red
npm run test:browser                # every reference: green
npx playwright test labs/06-router --project=chrome      # one lab
VARIANT=starter npx playwright test labs/06-router --project=chrome
```

The browser tests run one worker per test file (each lab has its own ports), up to your CPU count minus one; `PW_WORKERS=2` caps it. Running several browsers in one command (`--project=chrome --project=firefox`) would put the same file in two workers on the same ports, so add `--workers=1` then.

Tests named **observe** describe how the platform behaves and pass on both variants; they are there so you can see it for yourself. Tests named **exercise** are the ones your work turns green. Firefox runs too: `--project=firefox` after `npx playwright install firefox`.

Labs 09 and 10 have their own dependencies, which include native binaries for your OS. The test scripts install them for this machine first, and reinstall them if `node_modules` came from another platform. `npm run setup:labs` does only that step.

Labs 09, 10 and 13 also have Node tests that run without a browser: `VARIANT=starter npm test` in the lab folder, or `npm run test:labs` at the root for every reference.

## Conventions

- **Node 20 or newer.** Labs without an install use Node built-ins only.
- `node server.mjs` runs the starter; `VARIANT=solution node server.mjs` (or `npm run solution`) runs the reference. Every server also exports `start({ variant })`, which is what the tests call.
- Ports: 51xx for labs, 52xx for the capstone, so several can run at once. The browser tests start and stop their own servers, so stop yours first.
