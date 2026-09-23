// YOUR CATALOG ZONE — server-rendered and streamed (M1, M3, M4, M5).
//   GET /catalog      flush shell + product grid at once, then the recommendations
//                     fragment within a 400 ms budget, or a fallback (M3)
//   GET /catalog/:id  a product page with a plain <a> into the account zone (M1)
// Forward x-trace-id and accept-language to the fragment (M4); keep the HTML
// identical for every visitor and send Cache-Control: public (M5).
// The fragment service is already running on PORTS.recommendations (another team).
import { PORTS } from '../../../lib.mjs';
import { todo } from '../../todo.mjs';

export const start = () => todo('The catalog zone', PORTS.catalog, 'M1, M3, M4, M5');
