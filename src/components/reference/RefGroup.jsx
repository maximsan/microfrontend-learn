/** A titled group in the reference library. Put a Markdown bullet list inside. */
export const RefGroup = ({ title, children }) => (
  <div className="refgrp">
    <h4>{title}</h4>
    {children}
  </div>
);
