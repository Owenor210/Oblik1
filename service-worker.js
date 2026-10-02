const CACHE_NAME = "oblik1-v3";

const FILES = [
  "/Oblik1/",
  "/Oblik1/index.html",
  "/Oblik1/css/style.css",
  "/Oblik1/js/app.js",
  "/Oblik1/manifest.json",
  "/Oblik1/icons/icon-192.png",
  "/Oblik1/icons/icon-512.png",
  "/Oblik1/icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});