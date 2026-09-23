// When a table cell contains nothing but <Ok>, <No> or <Warn>, colour the cell
// itself: <td><Ok>Yes</Ok></td>  →  <td class="ok">Yes</td>
import { STATUS_CLASS as STATUS } from '../lib/statusClass.js';

export default function rehypeCellStatus() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (node.type === 'element' && (node.tagName === 'td' || node.tagName === 'th')) {
    const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
    const only = kids.length === 1 ? kids[0] : null;
    if (only && only.type === 'mdxJsxTextElement' && STATUS[only.name]) {
      node.properties = { ...node.properties, className: [STATUS[only.name]] };
      node.children = only.children;
    }
  }
  if (node.children) node.children.forEach(walk);
}
