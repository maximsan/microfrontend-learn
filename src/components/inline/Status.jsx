/**
 * Status colouring for a table cell. When <Ok>, <No> or <Warn> is the only
 * thing in a cell, the rehypeCellStatus plugin moves the class onto the <td>.
 */
export const Ok = ({ children }) => <span className="ok">{children}</span>;
export const No = ({ children }) => <span className="no">{children}</span>;
export const Warn = ({ children }) => <span className="warn">{children}</span>;
