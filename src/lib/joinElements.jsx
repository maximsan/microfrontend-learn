/**
 * Render a list with a separator between items, each wrapped in a keyed <span>:
 *   joinElements(chapters, ', ', (c) => c.id, (c) => <Mod to={c.id} num />)
 */
export const joinElements = (items, separator, keyOf, render) =>
  items.map((item, i) => (
    <span key={keyOf(item)}>{i ? separator : ''}{render(item)}</span>
  ));
