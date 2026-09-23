// The resource server. It trusts identity only from the BFF (shared internal
// secret — a stand-in for mTLS or a service mesh), and it is where every
// authorization decision is enforced: a user only ever sees their own data.
import http from 'node:http';
import { PORTS, INTERNAL_SECRET, safeEqual, readJson, json, log, listen } from '../../lib.mjs';

const carts = new Map();   // user → [{ product, qty }]
const orders = new Map([['max', [{ id: 1042, items: 2, status: 'shipped' }]]]);

export function createApi() {
  return http.createServer(async (req, res) => {
    res.on('finish', () => log('api', req, res.statusCode));
    if (!safeEqual(String(req.headers['x-internal-auth'] ?? ''), INTERNAL_SECRET)) return json(res, 401, { error: 'unauthenticated' });
    const user = String(req.headers['x-user'] ?? '');
    if (!user) return json(res, 401, { error: 'no_user' });

    if (req.url === '/api/cart' && req.method === 'GET') return json(res, 200, { items: carts.get(user) ?? [] });
    if (req.url === '/api/cart' && req.method === 'POST') {
      const { product } = await readJson(req);
      if (!/^p\d+$/.test(String(product))) return json(res, 400, { error: 'bad_product' });
      const items = carts.get(user) ?? [];
      const line = items.find((i) => i.product === product);
      if (line) line.qty++; else items.push({ product, qty: 1 });
      carts.set(user, items);
      return json(res, 201, { items });
    }
    if (req.url === '/api/orders' && req.method === 'GET') return json(res, 200, orders.get(user) ?? []);
    json(res, 404, { error: 'not_found' });
  });
}

export const start = () => listen(createApi(), PORTS.api);
