// Service Worker для Обліку
const V = 'oblik-v3';

const FILES = [
  '/Oblik1/',
  '/Oblik1/index.html',
  '/Oblik1/css/style.css',
  '/Oblik1/js/app.js',
  '/Oblik1/manifest.json',
  '/Oblik1/icons/icon-192.png',
  '/Oblik1/icons/icon-512.png',
  '/Oblik1/icons/icon-maskable-512.png'
];

// Встановлення
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(V)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Активація
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== V)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Робота офлайн
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => caches.match('/Oblik1/index.html'))
  );
});
