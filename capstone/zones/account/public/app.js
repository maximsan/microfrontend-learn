// Account zone client. One router owns history *for this document* (the zone);
// links out of /account are left to the browser as full navigations.
const main = document.getElementById('main');
const announcer = document.getElementById('acme-announcer');

const VIEWS = {
  '/account': async () => ({ title: 'Account', html: `<p>Hello${window.acme.getUser() ? `, ${window.acme.getUser()}` : ''}. Orders and cart live in this zone; the catalog is another team's zone.</p>` }),
  '/account/orders': async () => {
    const res = await window.acme.api('/orders');
    if (res.status === 401) return signedOut('your orders');
    const orders = await res.json();
    return { title: 'Orders', html: `<ul>${orders.map((o) => `<li>#${o.id} · ${o.items} item(s) · ${o.status}</li>`).join('') || '<li>No orders yet.</li>'}</ul>` };
  },
  '/account/cart': async () => {
    const res = await window.acme.api('/cart');
    if (res.status === 401) return signedOut('your cart');
    const cart = await res.json();
    const rows = cart.items.map((i) => `<li>${i.product} × ${i.qty}</li>`).join('');
    return { title: 'Cart', html: `<ul>${rows || '<li>Your cart is empty. <a href="/catalog">Browse the catalog</a>.</li>'}</ul>` };
  },
};
const signedOut = (what) => ({ title: 'Sign in', html: `<p>Sign in to see ${what}. <a href="/bff/login?returnTo=${encodeURIComponent(location.pathname)}">Sign in</a></p>` });

async function render(pathname) {
  const view = VIEWS[pathname] ?? (async () => ({ title: 'Not found', html: '<p>No such page.</p>' }));
  const { title, html } = await view();
  main.innerHTML = `<h1 tabindex="-1">${title}</h1>${html}`;
  document.title = `${title} · Acme`;
  announcer.textContent = `${title} page`;
  main.querySelector('h1').focus({ preventScroll: true });
}

navigation.addEventListener('navigate', (e) => {
  const url = new URL(e.destination.url);
  // Only this zone's paths are client-routed; everything else is a real navigation.
  if (!e.canIntercept || e.hashChange || e.downloadRequest !== null || !(url.pathname in VIEWS)) return;
  e.intercept({ focusReset: 'manual', scroll: 'after-transition', handler: () => render(url.pathname) });
});

// Re-render when the session changes (sign-out in another tab, for example).
window.acme.on('user', () => render(location.pathname));
