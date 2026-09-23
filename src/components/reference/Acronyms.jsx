import { DefinitionRow } from './DefinitionRow.jsx';

/** Container for <Acro> rows. */
export const Acronyms = ({ children }) => <dl className="acro">{children}</dl>;

/**
 * One acronym. The row id is "acro-<term in lower case>", which the client
 * script uses to link the first use of the term in every module.
 */
export const Acro = ({ term, children }) => (
  <DefinitionRow className="row2" id={`acro-${term.toLowerCase()}`} term={term}>{children}</DefinitionRow>
);
