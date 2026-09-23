// The resource server: the only place authorization is actually enforced.
import http from 'node:http';
import { ORIGINS, json, readForm } from './lib.mjs';
import { isValidAccess } from './authserver.mjs';

const orders = [{ id: 1042, item: 'Keyboard', user: 'max' }];
const cors = {
  'access-control-allow-origin': ORIGINS.app,
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST',
};

async function handle(req, res) {
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  const who = isValidAccess(token);
  if (!who) return json(res, 401, { error: 'invalid_token' }, { ...cors, 'www-authenticate': 'Bearer' });

  if (req.url === '/api/orders' && req.method === 'GET') {
    return json(res, 200, orders.filter((o) => o.user === who.user), cors);
  }
  if (req.url === '/api/orders' && req.method === 'POST') {
    const body = await readForm(req);
    const order = { id: 1043 + orders.length, item: String(body.item ?? 'Something'), user: who.user };
    orders.push(order);
    return json(res, 201, order, cors);
  }
  json(res, 404, { error: 'not_found' }, cors);
}

export const startApi = (port = 5121) =>
  new Promise((r) => { const s = http.createServer(handle).listen(port, () => r(s)); });
