import { classed } from '../../lib/classed.jsx';
import { DefinitionRow } from './DefinitionRow.jsx';

/** Container for <Term> rows. */
export const Glossary = classed('dl', 'gloss');

/** One glossary entry. */
export const Term = ({ name, children }) => <DefinitionRow className="gterm" term={name}>{children}</DefinitionRow>;
