import { PUBLISHED_AT } from '../shared/data.js';

/** Formats with the *runtime's* time zone: UTC on this server, yours in the browser. */
function formatPublished() {
  return new Date(PUBLISHED_AT).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function Published() {
  return <time dateTime={PUBLISHED_AT}>published {formatPublished()}</time>;
}
