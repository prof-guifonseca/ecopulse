// EcoPulse service worker — suporte offline + instalação (PWA local-first).
// Hand-rolled de propósito: Serwist/Workbox exigem configuração webpack e o
// projeto builda com Turbopack. Sem push (não há backend/VAPID): só os ciclos
// install / activate / fetch.

const VERSION = 'v2';
const SHELL = `ecopulse-shell-${VERSION}`; // app shell: rotas, _next/static, ícones
const DATA = `ecopulse-data-${VERSION}`; // respostas das APIs (capadas)
const MEDIA = `ecopulse-media-${VERSION}`; // tiles do mapa + imagens externas (capadas)
const CURRENT = [SHELL, DATA, MEDIA];

const PRECACHE_URLS = [
  '/home',
  '/onboarding',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const DATA_MAX = 200;
const MEDIA_MAX = 200;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // add individual (não addAll) para um 404 não abortar todo o precache.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('ecopulse-') && !CURRENT.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Basemap tiles/glyphs/sprites (OpenFreeMap, com fallback OSM raster):
  // imutáveis por z/x/y → cache-first.
  if (url.hostname === 'tiles.openfreemap.org' || url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(cacheFirst(request, MEDIA, MEDIA_MAX));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // Payloads RSC (navegação client-side) mudam por build → sempre rede.
    if (url.searchParams.has('_rsc')) {
      event.respondWith(fetch(request).catch(() => caches.match(request)));
      return;
    }
    // Assets versionados (hash imutável) → stale-while-revalidate.
    if (
      url.pathname.startsWith('/_next/static') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname === '/manifest.webmanifest'
    ) {
      event.respondWith(staleWhileRevalidate(request, SHELL));
      return;
    }
    // Navegações de documento → network-first, cai para cache e por fim /home.
    if (request.mode === 'navigate') {
      event.respondWith(navigationHandler(request));
      return;
    }
    // Dados do scanner e do mapa → network-first com fallback ao cache (offline após 1º uso).
    if (url.pathname === '/api/products/lookup' || url.pathname === '/api/esg/places') {
      event.respondWith(networkFirst(request, DATA, DATA_MAX));
      return;
    }
    // Demais GET same-origin (imagens em /public etc.) → SWR.
    event.respondWith(staleWhileRevalidate(request, SHELL));
    return;
  }

  // Imagens/CDN cross-origin (ex.: Unsplash) → SWR capado.
  event.respondWith(staleWhileRevalidate(request, MEDIA, MEDIA_MAX));
});

function cacheable(response) {
  return !!response && (response.ok || response.type === 'opaque');
}

async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (cacheable(response)) {
      await cache.put(request, response.clone());
      void trimCache(cacheName, maxItems);
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (cacheable(response)) {
        cache.put(request, response.clone()).then(() => {
          if (maxItems) void trimCache(cacheName, maxItems);
        });
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

async function networkFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (cacheable(response)) {
      await cache.put(request, response.clone());
      void trimCache(cacheName, maxItems);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    if (cacheable(response)) {
      const cache = await caches.open(SHELL);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const home = await caches.match('/home');
    return home || Response.error();
  }
}

async function trimCache(cacheName, maxItems) {
  if (!maxItems) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const excess = keys.length - maxItems;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}
