// Solution: give each fragment a lifecycle. Everything a fragment starts is
// registered against an AbortController that is aborted when the fragment is
// replaced — the same duty as Stimulus's disconnect() or single-spa's unmount().
import { mountBadge } from '/runtime.js';
mountBadge();

let timers = 0;
const count = document.querySelector('#timers');
let current = null; // AbortController for the fragment currently in the slot

function hydrate(root) {
  const lifecycle = new AbortController();
  for (const el of root.querySelectorAll('[data-clock]')) {
    const id = setInterval(() => { el.textContent = new Date().toLocaleTimeString(); }, 100);
    timers++;
    lifecycle.signal.addEventListener('abort', () => { clearInterval(id); timers--; count.textContent = timers; });
  }
  count.textContent = timers;
  return lifecycle;
}

document.querySelector('#swap').addEventListener('click', async () => {
  const html = await (await fetch('/swap/fragment.html')).text();
  const slot = document.querySelector('#slot');
  current?.abort();        // tear down the outgoing fragment first
  slot.innerHTML = html;
  current = hydrate(slot);
});
