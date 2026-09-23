/** Container for <Term> rows. */
export const Glossary = ({ children }) => <dl className="gloss">{children}</dl>;

export const Term = ({ name, children }) => (
  <div className="gterm">
    <dt>{name}</dt>
    <dd>{children}</dd>
  </div>
);
