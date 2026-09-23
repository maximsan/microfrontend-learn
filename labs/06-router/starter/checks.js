// Self-check panel: after every client-side navigation, verify the four things a
// real navigation gives you. It listens for the `routed` event your router fires.
const panel = document.querySelector('#checks');
const announcer = document.querySelector('#announcer');

function check() {
  const h1 = document.querySelector('#view h1');
  const name = h1?.textContent.trim() ?? '';
  const rows = [
    ['focus moved to the new <h1>', document.activeElement === h1],
    ['document.title names the page', document.title.includes(name)],
    ['change announced (aria-live)', announcer.textContent.includes(name)],
    ['new page starts at the top', scrollY === 0],
  ];
  panel.innerHTML = `<b>After navigating to “${name}”</b>` +
    rows.map(([label, ok]) => `${ok ? '✅' : '❌'} ${label}`).join('<br>');
}
document.addEventListener('routed', () => requestAnimationFrame(() => requestAnimationFrame(check)));
panel.innerHTML = '<b>Self-check</b>Navigate with a link to run the checks.';
