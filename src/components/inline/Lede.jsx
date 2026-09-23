/** Hero paragraph; `small` for the second, quieter one. */
export const Lede = ({ small, children }) => <p className={small ? 'lede small' : 'lede'}>{children}</p>;
