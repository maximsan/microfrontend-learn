// Everything an .mdx chapter can use without importing it.
import { VerifiedDate } from './inline/VerifiedDate.jsx';
import { Ok, No, Warn } from './inline/Status.jsx';
import { Sub } from './inline/Sub.jsx';
import { ServerSide, ClientSide } from './inline/SideText.jsx';
import { Light } from './inline/Light.jsx';
import { Rev } from './inline/Rev.jsx';
import { Expiry } from './inline/Expiry.jsx';
import { Badge } from './inline/Badge.jsx';
import { Src } from './inline/Src.jsx';
import { Lede } from './inline/Lede.jsx';
import { Colophon } from './inline/Colophon.jsx';
import { Chip } from './inline/Chip.jsx';
import { Callout, Insight, Trap, Source, Moved } from './callouts/Callout.jsx';
import { Cite } from './callouts/Cite.jsx';
import { Quote } from './callouts/Quote.jsx';
import { Recap } from './callouts/Recap.jsx';
import { Check, Answers } from './callouts/Check.jsx';
import { Spectrum, Point } from './diagrams/Spectrum.jsx';
import { Timeline, Era } from './diagrams/Timeline.jsx';
import { Flow, Box, Arrow, FlowCaption } from './diagrams/Flow.jsx';
import { Wire, Step } from './diagrams/Wire.jsx';
import { Tree, Branch, Leaf } from './diagrams/Tree.jsx';
import { Acronyms, Acro } from './reference/Acronyms.jsx';
import { Glossary, Term } from './reference/Glossary.jsx';
import { RefGroup } from './reference/RefGroup.jsx';
import { Pre } from './markdown/Pre.jsx';
import { Table } from './markdown/Table.jsx';
import { Mod, Mods } from './xref/Mod.jsx';

export const mdxComponents = {
  VerifiedDate, Ok, No, Warn, Sub, ServerSide, ClientSide, Light, Rev, Expiry, Badge, Src, Lede, Colophon, Chip,
  Callout, Insight, Trap, Source, Moved, Cite, Quote, Recap, Check, Answers,
  Spectrum, Point, Timeline, Era, Flow, Box, Arrow, FlowCaption, Wire, Step, Tree, Branch, Leaf,
  Acronyms, Acro, Glossary, Term, RefGroup,
  Mod, Mods,
  Table, // also for hand-written JSX tables (e.g. with row headers)
  // Markdown-generated elements
  pre: Pre,
  table: Table,
};
