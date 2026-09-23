import { Component } from 'react';

/** A remote is a network call you do not control: every remote gets a boundary. */
export class RemoteBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(`[${this.props.name} remote]`, error); }
  render() {
    return this.state.failed ? <p className="fallback">The {this.props.name} is unavailable right now.</p> : this.props.children;
  }
}
