import { useState, version } from 'react';

// Which React is this? The shell leaves its own useState on globalThis so we can compare.
const source = globalThis.__SHELL_USE_STATE__
  ? (globalThis.__SHELL_USE_STATE__ === useState ? 'shared with the shell' : 'the cart’s own copy')
  : 'standalone';

export default function CartWidget() {
  const [items, setItems] = useState(0);   // a hook — only works with the React that is rendering us
  return (
    <section className="cart">
      <strong>Cart</strong> · {items} item{items === 1 ? '' : 's'}{' '}
      <button onClick={() => setItems((n) => n + 1)}>Add</button>
      <small> · React {version}, {source}</small>
    </section>
  );
}
