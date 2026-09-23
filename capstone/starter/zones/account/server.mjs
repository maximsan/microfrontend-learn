// YOUR ACCOUNT ZONE — a SPA (M1, M2).
//   Send the same document for every /account/* path and let public/app.js route.
//   Its data comes from the BFF at runtime and is never cached.
import { PORTS } from '../../../lib.mjs';
import { todo } from '../../todo.mjs';

export const start = () => todo('The account zone', PORTS.account, 'M1, M2');
