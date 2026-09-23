// The "pages". Each returns a title and HTML. Long filler makes scroll behaviour visible.
const filler = (n) => Array.from({ length: n }, (_, i) => `<p>Paragraph ${i + 1}. Scroll down, then navigate.</p>`).join('');

export function view(pathname) {
  const order = pathname.match(/^\/orders\/(\d+)$/);
  if (pathname === '/') return { title: 'Home', html: `<p>Welcome back.</p>${filler(30)}` };
  if (pathname === '/orders') return { title: 'Orders', html: `<ul><li><a href="/orders/1042">Order 1042</a></li><li><a href="/orders/1043">Order 1043</a></li></ul>${filler(30)}` };
  if (order) return { title: `Order ${order[1]}`, html: `<p>Status: shipped.</p>${filler(30)}` };
  if (pathname === '/settings') return { title: 'Settings', html: `<label>Display name <input value="Max"></label>${filler(30)}` };
  return { title: 'Not found', html: '<p>No such page.</p>' };
}
