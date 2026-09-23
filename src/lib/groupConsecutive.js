/**
 * Split a list into runs of consecutive items with the same key:
 *   groupConsecutive([a1, a2, b1, a3], (x) => x.k) → [['a', [a1, a2]], ['b', [b1]], ['a', [a3]]]
 */
export function groupConsecutive(list, key) {
  const out = [];
  for (const item of list) {
    const k = key(item);
    const last = out[out.length - 1];
    if (last && last[0] === k) last[1].push(item);
    else out.push([k, [item]]);
  }
  return out;
}
