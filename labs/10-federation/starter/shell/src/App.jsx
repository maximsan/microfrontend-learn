import { lazy, Suspense } from 'react';

// Resolved over the network at runtime — there is no 'cart' in node_modules.
const CartWidget = lazy(() => import('cart/CartWidget'));

export default function App() {
  return (
    <main>
      <h1>Acme shell</h1>
      <p>The widget below is built and deployed by another team.</p>
      {/* TODO (part 3): what happens to this page when the cart server is down? */}
      <Suspense fallback={<p>Loading cart…</p>}>
        <CartWidget />
      </Suspense>
    </main>
  );
}
