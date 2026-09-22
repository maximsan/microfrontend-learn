// Team Recommendations: a fragment service. It returns HTML, not JSON, plus a
// manifest describing its contract. It is sometimes slow and sometimes down —
// ?delay=ms and ?fail=1 let you make it so on purpose.
import http from 'node:http';
import { PORTS, buildId, escapeHtml, log, listen } from '../../lib.mjs';

const BUILD = buildId('recommendations');
const PICKS = { en: ['Wrist rest', 'Cable organiser', 'Monitor arm'], de: ['Handballenauflage', 'Kabelorganizer', 'Monitorarm'] };

export function createRecommendations() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://recs');
    res.on('finish', () => log('recommendations', req, res.statusCode));
    if (url.pathname === '/manifest.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ name: 'recommendations', version: BUILD, content: '/fragment', css: [], js: [], context: ['x-trace-id', 'accept-language'] }));
    }
    if (url.pathname === '/fragment') {
      const delay = Number(url.searchParams.get('delay') ?? process.env.RECS_DELAY_MS ?? 120);
      await new Promise((r) => setTimeout(r, delay));
      if (url.searchParams.get('fail')) { res.writeHead(500).end('boom'); return; }
      const locale = (req.headers['accept-language'] ?? 'en').slice(0, 2);
      const picks = PICKS[locale] ?? PICKS.en;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-build-id': BUILD, 'cache-control': 'public, max-age=30' });
      return res.end(`<ul class="acme-grid" data-recs data-trace="${escapeHtml(req.headers['x-trace-id'] ?? '')}" data-locale="${escapeHtml(locale)}">${picks.map((p) => `<li class="acme-card">${escapeHtml(p)}</li>`).join('')}</ul>`);
    }
    res.writeHead(404).end('Not found');
  });
}

export const start = () => listen(createRecommendations(), PORTS.recommendations);
