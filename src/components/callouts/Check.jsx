/** Self-check questions: a numbered list, optionally followed by <Answers>. */
export const Check = ({ children }) => (
  <div className="check">
    <span className="tag">Check yourself</span>
    {children}
  </div>
);

/** Collapsible answers inside <Check>. */
export const Answers = ({ children }) => (
  <details>
    <summary>Answers</summary>
    {children}
  </details>
);
