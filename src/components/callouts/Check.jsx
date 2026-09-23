import { LabelledBox } from './LabelledBox.jsx';

/** Self-check questions: a numbered list, optionally followed by <Answers>. */
export const Check = ({ children }) => <LabelledBox className="check" label="Check yourself">{children}</LabelledBox>;

/** Collapsible answers inside <Check>. */
export const Answers = ({ children }) => (
  <details>
    <summary>Answers</summary>
    {children}
  </details>
);
