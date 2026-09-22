// Glossary and reference-library blocks.

/** Container for <Acro> rows. */
export const Acronyms = ({ children }) => <dl className="acro">{children}</dl>;

/**
 * One acronym. The row id is "acro-<term in lower case>", which the client
 * script uses to link the first use of the term in every module.
 */
export const Acro = ({ term, children }) => (
  <div className="row2" id={`acro-${term.toLowerCase()}`}>
    <dt>{term}</dt>
    <dd>{children}</dd>
  </div>
);

/** Container for <Term> rows. */
export const Glossary = ({ children }) => <dl className="gloss">{children}</dl>;

export const Term = ({ name, children }) => (
  <div className="gterm">
    <dt>{name}</dt>
    <dd>{children}</dd>
  </div>
);

/** A titled group in the reference library. Put a Markdown bullet list inside. */
export const RefGroup = ({ title, children }) => (
  <div className="refgrp">
    <h4>{title}</h4>
    {children}
  </div>
);
