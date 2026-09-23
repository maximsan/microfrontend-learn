// Shell-owned realtime: one stream per *browser*, whatever the number of
// micro-frontends or tabs. One tab wins a Web Lock and holds the EventSource;
// it relays every message to the other tabs over BroadcastChannel.
const bus = new BroadcastChannel('acme:realtime');
const listeners = new Set();
let last = null; // "events are not state": keep the latest value for late subscribers

function deliver(msg) {
  last = msg;
  for (const fn of listeners) fn(msg);
}

bus.onmessage = (e) => deliver(e.data);

navigator.locks.request('acme:realtime-leader', () => {
  const es = new EventSource(`/events?who=leader-${Math.random().toString(36).slice(2, 6)}`);
  es.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    deliver(msg);          // BroadcastChannel does not echo to the sender
    bus.postMessage(msg);
  };
  return new Promise(() => {}); // hold the lock (and the stream) for this tab's lifetime
});

/** Subscribe; the callback also receives the current value immediately if there is one. */
export function subscribe(fn) {
  listeners.add(fn);
  if (last) fn(last);
  return () => listeners.delete(fn);
}
