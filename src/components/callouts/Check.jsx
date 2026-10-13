import { Children, isValidElement } from 'react';
import { LabelledBox } from './LabelledBox.jsx';
import { classed } from '../../lib/classed.jsx';
import { textOf } from '../../lib/textOf.js';

/** Self-check: <Question>s, which book.js turns into a one-at-a-time test. Older chapters still hold a numbered list and <Answers>. */
export const Check = ({ children }) => <LabelledBox className="check" label="Check yourself">{children}</LabelledBox>;

/** Collapsible answers inside <Check>, for chapters not yet converted to <Question>s. */
export const Answers = ({ children }) => (
  <details>
    <summary>Answers</summary>
    {children}
  </details>
);

/** Splits children into those of one component type and the rest. */
const split = (children, type) => {
  const all = Children.toArray(children);
  const matched = all.filter((c) => isValidElement(c) && c.type === type);
  return [matched, all.filter((c) => !matched.includes(c))];
};

/** Why an <Option> is right or wrong; shown for every option once the reader answers. */
export const Why = classed('div', 'quiz-why');

/** One answer to a <Question>. The buttons stay disabled until book.js runs. */
export const Option = ({ correct, children }) => {
  const [why, text] = split(children, Why);
  if (why.length !== 1) throw new Error(`<Option> "${textOf(text)}" needs exactly one <Why>`);
  return (
    <li className="quiz-opt" data-correct={correct ? '' : undefined}>
      <button type="button" disabled>{text}</button>
      {why}
    </li>
  );
};

/** A multiple-choice question: the prompt, then <Option>s, exactly one of them `correct`. */
export const Question = ({ children }) => {
  const [options, prompt] = split(children, Option);
  const correct = options.filter((o) => o.props.correct).length;
  if (options.length < 2 || correct !== 1) {
    throw new Error(`<Question> "${textOf(prompt)}" needs 2 or more <Option>s with exactly one correct (has ${options.length}, ${correct} correct)`);
  }
  return (
    <div className="quiz-q">
      <div className="quiz-ask">{prompt}</div>
      <ul className="quiz-opts">{options}</ul>
    </div>
  );
};
