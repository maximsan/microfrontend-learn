// Solution: micro-frontends subscribe to the shell's stream instead of opening their own.
import { subscribe } from '/realtime.js';

const TEAMS = ['header', 'cart', 'search', 'recommendations', 'notifications', 'chat', 'inventory'];
const grid = document.querySelector('#grid');

for (const team of TEAMS) {
  const box = document.createElement('div');
  box.className = 'mf stale';
  box.innerHTML = `<b>${team}</b><span>waiting for the shell…</span>`;
  grid.append(box);
  subscribe((msg) => {
    box.className = 'mf';
    box.querySelector('span').textContent = `tick ${msg.at.slice(11, 19)} · via ${msg.holders.join(', ')}`;
    document.querySelector('#streams').textContent = msg.streams;
  });
}

document.querySelector('#ping').addEventListener('click', async () => {
  const out = document.querySelector('#pong');
  out.textContent = 'waiting…';
  const t0 = performance.now();
  const res = await fetch('/api/ping');
  out.textContent = `answered after ${Math.round(performance.now() - t0)} ms — ${(await res.json()).pong}`;
});
