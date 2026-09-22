// Everything an .mdx chapter can use without importing it.
import * as inline from './inline.jsx';
import * as callouts from './callouts.jsx';
import * as diagrams from './diagrams.jsx';
import * as reference from './reference.jsx';
import { Pre, Table } from './code.jsx';
import { Mod } from './xref.jsx';

export const mdxComponents = {
  ...inline,
  ...callouts,
  ...diagrams,
  ...reference,
  Mod,
  Table, // for hand-written JSX tables (e.g. with row headers)
  // Markdown-generated elements
  pre: Pre,
  table: Table,
};
