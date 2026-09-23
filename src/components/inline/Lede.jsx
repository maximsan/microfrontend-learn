/** Hero paragraph; `small` for the second, quieter one. */
export const Lede = ({ small, children }) => (
  <p className="lede" style={small ? { fontSize: 17 } : undefined}>{children}</p>
);
