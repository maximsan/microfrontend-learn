import { use } from 'react';
import { load } from '../shared/data.js';

export function Sidebar({ scope }) {
  const links = use(load('sidebar', scope));
  // Part 3 of the lab: ?boom makes this component fail on the client only.
  if (typeof window !== 'undefined' && location.search.includes('boom')) {
    throw new Error('Sidebar team shipped a bug');
  }
  return (
    <nav aria-label="Related">
      <h2>Related</h2>
      <ul>{links.map((l) => <li key={l}>{l}</li>)}</ul>
    </nav>
  );
}
