// YOUR GATEWAY — the only origin the browser sees (M1, M4, M6, M7).
//   /catalog…, /account…  → proxy to the zones, streaming the response through (M1)
//   /shell/…              → serve ../shell/tokens.css and ../shell/client.js (M2)
//   /bff/…                → the BFF: login, me, logout, api/* with CSRF checks (M6)
//   /events               → one server-sent-event stream of stock levels (M7)
//   every request         → mint or honour x-trace-id, set x-build-id (M4)
// Replace the stub below. The reference lives in ../../gateway/server.mjs.
import { PORTS } from '../../lib.mjs';
import { todo } from '../todo.mjs';

export const start = () => todo('The gateway', PORTS.gateway, 'M1, M2, M4, M6, M7');
