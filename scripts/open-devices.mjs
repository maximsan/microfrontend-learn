// Opens scripts/devices.html, the side-by-side width preview, in the default browser.
//   npm run preview:devices    (builds the book first)
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const page = fileURLToPath(new URL('./devices.html', import.meta.url));
const [cmd, ...args] =
  process.platform === 'darwin' ? ['open'] : process.platform === 'win32' ? ['cmd', '/c', 'start', ''] : ['xdg-open'];

console.log(`Device preview: ${page}`);
let reported = false;
const cannotOpen = () => {
  if (!reported) console.log('Could not open a browser; open the file above by hand.');
  reported = true;
};
spawn(cmd, [...args, page], { stdio: 'ignore', windowsHide: true })
  .on('error', cannotOpen) // no opener installed
  .on('exit', (code) => code && cannotOpen()); // the opener ran but failed
