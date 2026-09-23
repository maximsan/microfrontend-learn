import { SIDE_COLOR } from '../../lib/sideColor.js';

const sideText = (side) => ({ children }) => (
  <span style={{ color: SIDE_COLOR[side], fontWeight: 600 }}>{children}</span>
);

/** Text coloured as the server end or the client end of the spectrum. */
export const ServerSide = sideText('server');
export const ClientSide = sideText('client');
