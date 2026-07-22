/* BARWORK Service Worker – Offline-Cache & Updates */
const VERSION = 'barwork-v5-notifications';
const FONT_CACHE = 'barwork-fonts-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-16.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== VERSION && k !== FONT_CACHE) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

// Benachrichtigung angetippt: App-Fenster fokussieren oder neu öffnen
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clientsList) {
      if ('focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // App-Navigation: erst Netzwerk (aktuellste Version), sonst Cache (offline)
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const c = await caches.open(VERSION);
        c.put('./index.html', net.clone());
        return net;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Google Fonts: aus Cache liefern, im Hintergrund aktualisieren
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith((async () => {
      const c = await caches.open(FONT_CACHE);
      const cached = await c.match(req);
      const network = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || network;
    })());
    return;
  }

  // Eigene Dateien (Icons etc.): erst Cache, sonst Netzwerk
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const net = await fetch(req);
        const c = await caches.open(VERSION);
        c.put(req, net.clone());
        return net;
      } catch (err) {
        return cached || Response.error();
      }
    })());
  }
});
