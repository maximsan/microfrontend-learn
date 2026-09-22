import { Component, lazy, Suspense } from 'react';

const CartWidget = lazy(() => import('cart/CartWidget'));

// A remote is a network call you do not control: every remote gets a boundary.
class RemoteBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[cart remote]', error); }
  render() {
    return this.state.failed ? <p className="fallback">The cart is unavailable right now.</p> : this.props.children;
  }
}

export default function App() {
  return (
    <main>
      <h1>Acme shell</h1>
      <p>The widget below is built and deployed by another team.</p>
      <RemoteBoundary>
        <Suspense fallback={<p>Loading cart…</p>}>
          <CartWidget />
        </Suspense>
      </RemoteBoundary>
    </main>
  );
}
