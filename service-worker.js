// Змінюйте версію після кожного оновлення файлів.
const V = 'oblik-v2';

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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(V)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});
