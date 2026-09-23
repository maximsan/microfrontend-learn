// Which copy runs, from the VARIANT environment variable: your starter/ or the
// reference solution/. Used by every lab and by the capstone.
//
//   node server.mjs                       a lab by hand opens your starter
//   VARIANT=solution node server.mjs      …or the reference
//   npm test                              tests (and the capstone) check the reference
//   VARIANT=starter npm test              …or your starter
//
// The defaults differ on purpose: running a lab is for working on your copy,
// while a bare `npm test` proves the reference still passes.

/** VARIANT, or `fallback` when it is unset. Any other value fails loudly instead of running the wrong copy. */
export function readVariant(fallback = 'solution') {
  const v = process.env.VARIANT ?? fallback;
  if (v !== 'starter' && v !== 'solution') throw new Error(`VARIANT must be "starter" or "solution", not "${v}"`);
  return v;
}

/** The folders a variant is served from, most specific first: solution/ overrides starter/ file by file. */
export const variantRoots = (variant, base) =>
  (variant === 'solution' ? ['solution/', 'starter/'] : ['starter/']).map((dir) => new URL(dir, base));
