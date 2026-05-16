const CACHE_NAME = 'fourball-v2';
const ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always try fresh content, fall back to cache offline.
// Never cache sw.js itself — the browser handles SW versioning, and caching
// it here can pin the app to an old service worker.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isServiceWorker = url.pathname === '/sw.js';

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!isServiceWorker) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
