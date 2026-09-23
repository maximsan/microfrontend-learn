import { Children, cloneElement } from 'react';
import { textOf } from '../../lib/textOf.js';

/**
 * Tables scroll horizontally inside a frame on wide screens. On phones, tables
 * with three or more columns become one card per row: every body cell gets a
 * data-label with its column header, which the stylesheet prints above it.
 */
export function Table({ children, ...props }) {
  const kids = Children.toArray(children);
  const head = kids.find((k) => k.type === 'thead');
  const headRow = head && Children.toArray(head.props.children).find((r) => r.type === 'tr');
  const labels = headRow ? Children.toArray(headRow.props.children).map(textOf) : [];
  const cols = labels.length;
  const labelled = kids.map((k) =>
    k.type !== 'tbody' ? k : cloneElement(k, {}, Children.map(k.props.children, (row) =>
      row?.type !== 'tr' ? row : cloneElement(row, {}, Children.map(row.props.children, (cell, i) =>
        cell?.type === 'td' || cell?.type === 'th' ? cloneElement(cell, { 'data-label': labels[i] || undefined }) : cell)))));
  return (
    <div className="tscroll">
      <table {...props} className={cols >= 3 ? 'stack' : `cols-${cols}`}>{labelled}</table>
    </div>
  );
}
