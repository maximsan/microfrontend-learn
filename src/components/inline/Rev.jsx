const REV_LABEL = { oneway: 'One-way', costly: 'Costly', cheap: 'Cheap' };

/** Reversibility marker: kind = "oneway" | "costly" | "cheap". */
export const Rev = ({ kind }) => <span className={`rev ${kind}`}>{REV_LABEL[kind]}</span>;
