// Shared by the starter stubs: answer every request with what is still to build.
import http from 'node:http';
import { listen } from '../lib.mjs';

export function todo(name, port, milestones) {
  const server = http.createServer((req, res) => {
    res.writeHead(501, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`${name} is not built yet.\n\nMilestones that need it: ${milestones}\nSee the chapter "Capstone: Acme Shop" and capstone/starter/README.md.\n`);
  });
  return listen(server, port);
}
