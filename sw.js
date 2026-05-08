// sw.js — Service Worker for Instant Weather PWA
const CACHE = 'instant-weather-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/weather.html',
  '/style.css',
  '/app.js',
  '/weatherApi.js',
  '/ui.js',
  '/utils.js',
  '/manifest.json',
  '/assets/images/sun.png',
  '/assets/fonts/Gilroy-Bold.ttf',
  '/assets/fonts/Gilroy-Heavy.ttf',
  '/assets/fonts/Gilroy-Medium.ttf',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Network-first for API calls (always want fresh data)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for WeatherAPI icon CDN
  if (url.hostname.includes('weatherapi.com')) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Cache-first for all other assets (fonts, CSS, JS, images)
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(request, clone));
      return res;
    }))
  );
});
