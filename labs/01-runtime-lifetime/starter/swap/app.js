// A hypermedia-style page: the server returns HTML fragments, we swap them in.
// The document never reloads, so this runtime lives as long as the tab.
import { mountBadge } from '/runtime.js';
mountBadge();

let timers = 0;
const count = document.querySelector('#timers');

// "Behaviour" for any fragment: start a clock for every [data-clock] element.
function hydrate(root) {
  for (const el of root.querySelectorAll('[data-clock]')) {
    timers++;
    setInterval(() => { el.textContent = new Date().toLocaleTimeString(); }, 100);
  }
  count.textContent = timers;
}

document.querySelector('#swap').addEventListener('click', async () => {
  const html = await (await fetch('/swap/fragment.html')).text();
  const slot = document.querySelector('#slot');
  slot.innerHTML = html;   // the old fragment's DOM is gone …
  hydrate(slot);           // … but was its timer?
});
