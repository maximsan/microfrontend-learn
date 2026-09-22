// Solution: one central interception point (the Navigation API), and the four
// duties a real navigation performs — focus, announcement, title, scroll.
import { view } from './views.js';

const main = document.querySelector('#view');
const announcer = document.querySelector('#announcer');

function render(pathname) {
  const { title, html } = view(pathname);
  main.innerHTML = `<h1 tabindex="-1">${title}</h1>${html}`;
  document.title = `Acme · ${title}`;                        // 3. title
  announcer.textContent = `${title} page`;                   // 2. announcement
  main.querySelector('h1').focus({ preventScroll: true });   // 1. focus
  document.dispatchEvent(new CustomEvent('routed'));
}

if (!('navigation' in window)) {
  main.innerHTML = '<h1>This browser has no Navigation API</h1><p>Use a current Chrome, Edge, Firefox or Safari.</p>';
} else {
  navigation.addEventListener('navigate', (event) => {
    const url = new URL(event.destination.url);
    // Leave downloads, other origins and full reloads to the browser.
    if (!event.canIntercept || event.hashChange || event.downloadRequest !== null || url.origin !== location.origin) return;
    event.intercept({
      focusReset: 'manual',   // we move focus to the <h1> ourselves
      scroll: 'after-transition', // 4. top of page on push, restored position on back/forward
      async handler() { render(url.pathname); },
    });
  });
  // The navigate event does not fire for the initial load.
  render(location.pathname);
}
