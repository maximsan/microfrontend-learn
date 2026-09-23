# Capstone starter

Build Acme Shop yourself. The **recommendations** fragment service and the **API** belong to other teams and already run. What you build is the platform and the two zones:

| File | You build | Milestones |
| --- | --- | --- |
| `gateway/server.mjs` | the single origin: zone proxy, BFF, `/events`, trace ids | M1, M2, M4, M6, M7 |
| `zones/catalog/server.mjs` | streamed server rendering with a fragment budget | M1, M3, M4, M5 |
| `zones/account/server.mjs`, `public/app.js` | the account SPA | M1, M2 |
| `shell/header.mjs`, `shell/client.js`, `shell/tokens.css` | the shared shell | M2, M6, M7 |

Every stub answers `501` and names what is missing, so all tests start red:

```sh
cd capstone
CAPSTONE_VARIANT=starter npm test              # 22 HTTP acceptance tests, all red
CAPSTONE_VARIANT=starter npm test -- --test-name-pattern=M3   # one milestone at a time
CAPSTONE_VARIANT=starter node start.mjs        # run your estate at http://localhost:5200
npm run test:browser:starter                   # from the repo root: the browser checks
```

Keep the same ports and paths as the reference (`capstone/lib.mjs` has them), and work through the milestones in order. Each one turns its group green. The reference implementation sits one folder up; open it only when you are stuck.
