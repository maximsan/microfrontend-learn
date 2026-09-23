/**
 * A component that renders one element with a fixed class around its children:
 *   export const Src = classed('span', 'src');   <Src>…</Src> → <span class="src">…</span>
 * For the many components that are nothing more than a styled wrapper.
 */
export const classed = (Tag, className) => ({ children }) => <Tag className={className}>{children}</Tag>;
