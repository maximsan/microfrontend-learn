/**
 * Status colouring for a table cell. When <Ok>, <No> or <Warn> is the only
 * thing in a cell, the rehypeCellStatus plugin moves the class onto the <td>.
 */

/** Component name → CSS class. The rehypeCellStatus plugin reads the same map. */
export const STATUS_CLASS = { Ok: 'ok', No: 'no', Warn: 'warn' };

const status = (className) => ({ children }) => <span className={className}>{children}</span>;

export const Ok = status(STATUS_CLASS.Ok);
export const No = status(STATUS_CLASS.No);
export const Warn = status(STATUS_CLASS.Warn);
