// /public/service-worker.js
const CACHE_NAME = "vesthub-cache-v1";
const ASSETS_TO_CACHE = [
   "/",
   "/index.html",
   "/manifest.json",
   "/icons/icon-192.png",
   "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
   console.log("Dev SW: Installed");
   event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
   );
   self.skipWaiting();
});

self.addEventListener("activate", (event) => {
   console.log("Dev SW: Activated");
   self.clients.claim();
});

self.addEventListener("fetch", (event) => {
   event.respondWith(
      caches.match(event.request).then((resp) => resp || fetch(event.request)),
   );
});
