import { useEffect, useState } from 'react';
import { PUBLISHED_AT } from '../shared/data.js';

/**
 * The first render must be identical on server and client, so it names the
 * zone explicitly. After hydration we switch to the reader's local time —
 * an effect never runs on the server, so it cannot cause a mismatch.
 */
export function formatPublished(iso = PUBLISHED_AT, timeZone = 'UTC') {
  const s = new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone });
  return timeZone === 'UTC' ? `${s} UTC` : s;
}

export function Published() {
  const [text, setText] = useState(() => formatPublished());
  useEffect(() => {
    setText(formatPublished(PUBLISHED_AT, Intl.DateTimeFormat().resolvedOptions().timeZone));
  }, []);
  return <time dateTime={PUBLISHED_AT}>published {text}</time>;
}
