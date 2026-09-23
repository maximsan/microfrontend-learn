# Capstone · Acme Shop

The capstone puts the book's main defaults together in one small working system. Everything in it uses Node built-ins only: no framework, no bundler, no `npm install`. Every mechanism is small enough to read in one sitting.

**The book chapter (*Capstone: Acme Shop*) is the full brief:** the architecture, the milestones, and which module each decision comes from. This file is the quick reference.

```sh
cd capstone
npm start            # http://localhost:5200
npm test             # 22 acceptance tests against the reference estate
node start.mjs --without=recommendations   # a team is down; the page should not care
```

## The estate

| Port | Service | Owner | Book |
| --- | --- | --- | --- |
| 5200 | `gateway/`: the only origin the browser sees. Zone routing, BFF, `/events`, runtime shell | Platform | Micro-frontends, Auth architecture, Sessions |
| 5201 | `zones/catalog/`: server-rendered and streamed; recommendations fragment within a 400 ms budget | Catalog | Rendering modes, Streaming |
| 5202 | `zones/account/`: a SPA on the Navigation API | Account | Location, history, URL |
| 5203 | `services/recommendations/`: an HTML fragment service with a manifest | Recommendations | Streaming |
| 5204 | `services/api/`: the resource server; the only place permissions are enforced | Commerce | Sessions |
| — | `shell/`: `header.mjs` (build-time, versioned) + `client.js`, `tokens.css` (runtime, central) | Platform | Sharing a surface, Transports |

## Things to try

- Open <http://localhost:5200>, **Add to cart** (sign in), then open **Cart**. You crossed a zone boundary with a full page load, and the session cookie and the header survived.
- Load `/catalog?recs.delay=2000` and `/catalog?recs.fail=1`: the page streams and degrades, and never waits longer than the budget.
- Open two tabs and **Sign out** in one; the other follows. Watch the server: one `/events` stream, however many tabs.
- Send `x-trace-id: incident-4711` with `curl -H` and grep the logs: every service prints it.
- Start with `BUILD_CATALOG=catalog@1.1.0 npm start` and open *What is running* in the footer.

## Rebuilding it yourself

`starter/` is the skeleton to build in. The recommendations fragment service and the API are other teams' and already run; you build the gateway, both zones and the shared shell. Every stub answers `501`, so every test starts red:

```sh
CAPSTONE_VARIANT=starter npm test                                  # 22 HTTP acceptance tests
CAPSTONE_VARIANT=starter npm test -- --test-name-pattern="M3"      # one milestone
CAPSTONE_VARIANT=starter npx playwright test capstone --project=chrome   # 9 browser tests (from the repo root)
CAPSTONE_VARIANT=starter npm start                                 # your estate on :5200
```

Work through the milestones in the chapter (M1 → M7); each one turns its group green. `starter/README.md` lists which file serves which milestone. The reference code in this folder is there for when you are stuck.

The acceptance tests only talk HTTP to the gateway, so they also work against an estate you run some other way: `CAPSTONE_URL=http://localhost:5200 npm test`.
