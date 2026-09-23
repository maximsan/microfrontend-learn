import { DefinitionRow } from './DefinitionRow.jsx';

/** Container for <Term> rows. */
export const Glossary = ({ children }) => <dl className="gloss">{children}</dl>;

/** One glossary entry. */
export const Term = ({ name, children }) => <DefinitionRow className="gterm" term={name}>{children}</DefinitionRow>;
