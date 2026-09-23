# Lab 11 · The six-connection budget

**Book:** *APIs and transports*  
**Time:** 25 minutes  
**You need:** Node 20+ and a desktop browser. No `npm install`.

Seven micro-frontends on one page each want live updates. The starter lets each open its own `EventSource`, which is the pattern the chapter calls out. You will watch the page run out of connections, then replace it with one shell-owned stream per **browser**, not per tab.

```sh
node labs/11-connection-budget/server.mjs                   # starter
VARIANT=solution node labs/11-connection-budget/server.mjs  # reference fix
```

The server speaks plain HTTP/1.1 on purpose and logs every stream as it opens and closes.

## 1 · Run out of connections

1. Open <http://localhost:5112>. Six boxes start ticking; the seventh stays red on *waiting for a connection…*.
2. Press **Call the API**. It hangs: the request is queued behind six long-lived streams.
3. Open a **second tab** on the same URL. Nothing in it connects at all, and the first tab is still stuck.

MDN documents the rule: over HTTP/1.1 the limit is per browser and set to six, and Chrome and Firefox have marked it *Won't fix*. DevTools → Network shows the queued requests as *Pending* / *Stalled*.

## 2 · Fix it: one stream, owned by the shell

Write `starter/realtime.js` and change `starter/app.js` so the micro-frontends **subscribe** instead of connecting:

- One tab becomes the leader with `navigator.locks.request('…', () => new Promise(() => {}))` and opens the only `EventSource`.
- The leader relays each message over a `BroadcastChannel`. It must also deliver locally, because a channel does not echo to its sender.
- `subscribe(fn)` also calls `fn` immediately with the last value it has seen. A micro-frontend that mounts late would otherwise show nothing until the next message (*events are not state*).

The whole of the solution's `realtime.js` is about 30 lines.

## 3 · Prove it

With the solution running:

1. The server log shows exactly **one** open stream, however many boxes there are.
2. Open three tabs: still one stream. Each box shows which leader it is receiving through.
3. Close the leader tab. Within a moment another tab takes the lock, opens a new stream, and the log shows `- leader-…` then `+ leader-…`.
4. **Call the API** answers immediately.

## Tests

3 browser tests. All three fail on the starter: seven streams, a stalled API call, no shared leader.

```sh
# from the repository root, once:  npm install   (and Google Chrome, or: npx playwright install chromium)
VARIANT=starter npx playwright test labs/11-connection-budget --project=chrome       # your copy: red until you finish
npx playwright test labs/11-connection-budget --project=chrome                       # the reference: green
```

Tests named *observe* describe the platform and pass on both. Tests named *exercise* are the ones you turn green.

## Check your understanding

- Serving the same page over HTTP/2 lifts the six-connection cap. Why is the shell-owned stream still the right design?
- Under routing-level zones, every zone crossing is a full page load. What happens to the leader and the stream when the user moves from `/catalog` to `/account`, and why does the Web Locks approach cope with it?
