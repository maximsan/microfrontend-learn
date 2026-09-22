// Prints the raw HTTP response as it arrives, with a timestamp per chunk.
// Start the server first, then:  node wire.mjs [url]
const url = process.argv[2] ?? 'http://localhost:5109/';
const t0 = performance.now();
const res = await fetch(url);
const decoder = new TextDecoder();
let n = 0;
for await (const chunk of res.body) {
  const text = decoder.decode(chunk, { stream: true });
  console.log(`\n\x1b[36m── chunk ${++n} at ${Math.round(performance.now() - t0)} ms (${text.length} chars) ──\x1b[0m`);
  console.log(text.length > 1600 ? `${text.slice(0, 800)}\n… ${text.length - 1600} chars …\n${text.slice(-800)}` : text);
}
