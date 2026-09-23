import { Children } from 'react';

/** A left-to-right chain of <Box> and <Arrow>. */
export const Flow = ({ children }) => {
  // More than three boxes do not fit side by side in the reading column: stack them.
  const boxes = Children.toArray(children).filter((c) => c.type === Box).length;
  return <div className={boxes > 3 ? 'flow flow-long' : 'flow'}>{children}</div>;
};

/** kind = "good" | "hot" | undefined */
export const Box = ({ kind, title, children }) => (
  <div className={kind ? `box ${kind}` : 'box'}>
    <b>{title}</b>
    <span>{children}</span>
  </div>
);

export const Arrow = ({ sym = '→', children }) => (
  <div className="arrow">
    <i>{sym}</i>
    <em>{children}</em>
  </div>
);

export const FlowCaption = ({ children }) => <p className="flowcap">{children}</p>;
