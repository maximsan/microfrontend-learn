// Fake data source. On the server each call waits, so you can watch the stream;
// on the client the same content resolves at once, so hydration renders the
// same tree the server did.
const CONTENT = {
  sidebar: ['Streaming SSR, explained', 'Islands vs micro-frontends', 'Why hydration fails'],
  post: {
    title: 'Out-of-order streaming',
    body: 'The shell arrives first. Each Suspense boundary arrives when its data does — not in markup order.',
  },
};
export const DELAY = { sidebar: 400, post: 1500 };

const cache = new Map();
/** Returns the same promise for the same key within one render (per request on the server). */
export function load(key, scope = cache) {
  if (!scope.has(key)) {
    const server = typeof window === 'undefined';
    scope.set(key, server ? new Promise((r) => setTimeout(() => r(CONTENT[key]), DELAY[key])) : Promise.resolve(CONTENT[key]));
  }
  return scope.get(key);
}

export const PUBLISHED_AT = '2026-09-01T21:30:00Z';
