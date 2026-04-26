const CACHE_NAME = 'haochijia-v41-lite-body-20260426i';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './assets/styles.css?v=20260426i',
  './assets/core.js?v=20260426i',
  './assets/model-scene.js?v=20260426i',
  './assets/body-models/standard-bodies-lite.json?v=20260426i',
  './assets/body-models/standard-bodies.json?v=20260426i',
  './assets/food-label-upgrade.js?v=20260426i',
  './assets/nutrition-refs.js?v=20260426i',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo.svg',
  './assets/vendor/three.module.js',
  './assets/vendor/OrbitControls.js'
];

const DATA_FILES = [
  './data/foods-cn.min.json?v=20260426i',
  './data/foods-global.part01.min.json?v=20260426i',
  './data/foods-global.part02.min.json?v=20260426i',
  './data/food-library-audit.json',
  './data/foods-regions.meta.json',
  './data/foods.meta.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone()).catch(() => null);
  return response;
}

async function networkWithCache(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => null);
    return response;
  } catch (error) {
    return (await caches.match(request, { ignoreSearch: false })) || (await caches.match('./index.html'));
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isDataFile = DATA_FILES.some((path) => url.pathname.endsWith(path.split('?')[0].replace('./', '/')));
  if (isDataFile) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(networkWithCache(req));
    return;
  }

  event.respondWith(networkWithCache(req));
});
