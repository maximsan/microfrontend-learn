/** Text coloured as the server end or the client end of the spectrum. */
export const ServerSide = ({ children }) => (
  <span style={{ color: 'var(--server)', fontWeight: 600 }}>{children}</span>
);
export const ClientSide = ({ children }) => (
  <span style={{ color: 'var(--client)', fontWeight: 600 }}>{children}</span>
);
