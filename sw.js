const CACHE_NAME = 'haochijia-v30-mobile-assist-20260419-r1';
const CORE = [
  './',
  './index.html',
  './404.html',
  './assets/styles.css',
  './assets/app.js',
  './assets/body-module.js',
  './assets/i18n.js',
  './assets/food-label-upgrade.js',
  './assets/music.js',
  './assets/nutrition-refs.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.webmanifest',
  './data/foods-regions.meta.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => /^haochijia-/i.test(key) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => null);
    return response;
  } catch (error) {
    return (await caches.match(request)) || (await caches.match('./index.html'));
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then(async (response) => {
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  }).catch(() => null);
  return cached || fetchPromise || caches.match('./index.html');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(staleWhileRevalidate(event.request));
});
