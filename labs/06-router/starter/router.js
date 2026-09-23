// A typical pushState router — it works for mouse users and fails everyone else.
// Your job: rebuild it on the Navigation API so it also does the four things the
// browser did on a real navigation (see README).
import { view } from './views.js';

const main = document.querySelector('#view');

function render() {
  const { title, html } = view(location.pathname);
  main.innerHTML = `<h1>${title}</h1>${html}`;
  document.dispatchEvent(new CustomEvent('routed'));
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/"]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  history.pushState(null, '', a.href);
  render();
});
addEventListener('popstate', render);
render();
