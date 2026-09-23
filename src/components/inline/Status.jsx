/**
 * Status colouring for a table cell. When <Ok>, <No> or <Warn> is the only
 * thing in a cell, the rehypeCellStatus plugin moves the class onto the <td>.
 */
import { classed } from '../../lib/classed.jsx';
import { STATUS_CLASS } from '../../lib/statusClass.js';

export const Ok = classed('span', STATUS_CLASS.Ok);
export const No = classed('span', STATUS_CLASS.No);
export const Warn = classed('span', STATUS_CLASS.Warn);
