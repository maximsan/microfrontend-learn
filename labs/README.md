# Labs

Hands-on exercises for the book. Each lab reproduces a trap from one chapter, makes it visible, and fixes it. Most include a `starter/` (your working copy), a `solution/` (only the files that change), and tests where the behaviour can be checked outside a browser.

| Lab | Chapter | Time | Install | Automated check |
| --- | --- | --- | --- | --- |
| [01 · Runtime lifetime](01-runtime-lifetime/) | The dividing line | 20 min | none | in the browser |
| [06 · A router that does what the browser did](06-router/) | Location, history, URL | 30–40 min | none | in-page self-check |
| [09 · Streaming SSR on the wire](09-streaming/) | Fragment streaming and hydration | 40 min | `npm install` | `npm test` (4 tests) |
| [10 · Module Federation, and where React comes from](10-federation/) | Bundlers and Module Federation | 45 min | `npm install` | `npm test` (2 tests) |
| [11 · The six-connection budget](11-connection-budget/) | APIs and transports | 25 min | none | in the browser |
| [13 · From tokens in localStorage to a BFF](13-bff-session/) | Auth architecture · Sessions · Migration paths | 60–90 min | none | `npm test` (9 tests) |
| [Capstone · Acme Shop](../capstone/) | Capstone: Acme Shop | a weekend | none | `npm test` (22 tests) |

Lab numbers match the chapter numbers at the time of writing.

## Conventions

- **Node 20 or newer.** Labs without an install use Node built-ins only.
- `node server.mjs` runs the starter; `node server.mjs --solution` (or `npm run solution`) runs the reference.
- Where there are tests, `npm test` checks the solution and `LAB_VARIANT=starter npm test` checks your copy. Your copy should fail until you finish the exercise.
- Ports: 51xx for labs, 52xx for the capstone, so several can run at once.
