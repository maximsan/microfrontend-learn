// Opens scripts/devices.html, the side-by-side width preview, in the default browser.
//   npm run preview:devices    (builds the book first)
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const page = fileURLToPath(new URL('./devices.html', import.meta.url));
const [cmd, ...args] =
  process.platform === 'darwin' ? ['open'] : process.platform === 'win32' ? ['cmd', '/c', 'start', ''] : ['xdg-open'];

spawn(cmd, [...args, page], { detached: true, stdio: 'ignore' })
  .on('error', () => console.log(`Open this file in a browser: ${page}`))
  .unref();
console.log(`Device preview: ${page}`);
