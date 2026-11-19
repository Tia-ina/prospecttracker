const CACHE = 'prospecttracker-web-v12';
const LOCAL = ['./', 'index.html', 'style.css', 'app.js', 'marche.js', 'menu.js', 'licence.js', 'recherche.js', 'splash.js', 'fond-tas.jpg', 'splash-fond.jpg', 'logo-tas.png', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const TAILWIND = 'https://cdn.tailwindcss.com';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(LOCAL);
    try { await c.put(TAILWIND, await fetch(TAILWIND, { mode: 'no-cors' })); } catch (err) {}
  }));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
    return r;
  }).catch(() => caches.match('index.html'))));
});
