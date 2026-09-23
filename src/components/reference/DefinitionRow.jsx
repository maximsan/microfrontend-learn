/** One <dt>/<dd> pair in its own wrapper, so a row can carry a class and an id. */
export const DefinitionRow = ({ className, id, term, children }) => (
  <div className={className} id={id}>
    <dt>{term}</dt>
    <dd>{children}</dd>
  </div>
);
