import { Component } from 'react';

/** Contains a failure to one fragment instead of the whole page. */
export class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error(`[${this.props.name}]`, error.message); }
  render() {
    return this.state.error
      ? <p className="fallback">{this.props.name} is unavailable right now.</p>
      : this.props.children;
  }
}
