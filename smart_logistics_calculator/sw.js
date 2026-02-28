// Smart Logistics Calculator — Service Worker
// Cache version: bump this string whenever you deploy new files
const CACHE_NAME = 'slc-v2.2';

// All local assets to pre-cache on install
const LOCAL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './custom-pages.js',
  './enhancements.js',
  './enhancements-part2.js',
  './export-center.js',
  './budget-editor.js',
  './budget-export.js',
  './budget-storage.js',
  './kpi-dashboard.js',
  './lean-extensions.js',
  './learn-pages.js',
  './quiz-data.js',
  './translations-patch.js',
  './warehouse-layout.js',
  './libs/papaparse.min.js',
  './libs/xlsx.full.min.js',
  './libs/chart.min.js',
  './libs/plotly.min.js',
  './manifest.json',
  './icon.svg',
];

// CDN assets — fetched and cached at runtime (network-first, fallback to cache)
const CDN_ORIGINS = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
];

// ── Install: pre-cache all local assets ─────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_ASSETS))
  );
});

// ── Activate: delete old caches ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: serve cached assets, update CDN resources in background ───────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  const isCDN = CDN_ORIGINS.some(origin => request.url.startsWith(origin));

  if (isCDN) {
    // Network-first for CDN: try network, fall back to cache
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first for local assets: serve instantly from cache, update in background
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
  }
});
