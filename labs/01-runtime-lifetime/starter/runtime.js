// Shared by every page in this lab. It answers one question on screen:
// "is this the same JavaScript runtime as a moment ago?"
window.__runtimeId ??= Math.random().toString(36).slice(2, 8);
window.__clicks ??= 0;

export function mountBadge() {
  const el = document.querySelector('#badge');
  const paint = () => {
    const age = ((performance.now()) / 1000).toFixed(1);
    el.innerHTML =
      `runtime <b>${window.__runtimeId}</b> · alive <b>${age}s</b> · clicks kept in memory <b>${window.__clicks}</b>`;
  };
  document.querySelector('#click')?.addEventListener('click', () => { window.__clicks++; paint(); });
  setInterval(paint, 250);
  paint();
}

// bfcache: did this page come back from the back/forward cache?
addEventListener('pageshow', (e) => {
  const el = document.querySelector('#bfcache');
  if (el) el.textContent = e.persisted ? 'restored from bfcache — heap thawed, same runtime' : 'fresh load';
});
if (new URLSearchParams(location.search).has('unload')) {
  // One unload listener is enough to make the page ineligible for bfcache in most browsers.
  addEventListener('unload', () => {});
}
