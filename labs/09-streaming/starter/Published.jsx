import { PUBLISHED_AT } from '../shared/data.js';

/** Formats with the *runtime's* time zone: UTC on this server, yours in the browser. */
export function formatPublished(iso = PUBLISHED_AT) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function Published() {
  return <time dateTime={PUBLISHED_AT}>published {formatPublished()}</time>;
}
