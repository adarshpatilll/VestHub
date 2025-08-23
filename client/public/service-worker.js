// A very simple service worker for VestHub
self.addEventListener("install", (event) => {
   console.log("Service Worker: Installed");
   event.waitUntil(
      caches.open("vesthub-cache").then((cache) => {
         return cache.addAll([
            "/", // homepage
            "/index.html", // base HTML
            "/manifest.json", // manifest
            "/icons/icon-192.png",
            "/icons/icon-512.png",
         ]);
      }),
   );
});

self.addEventListener("fetch", (event) => {
   event.respondWith(
      caches.match(event.request).then((response) => {
         return response || fetch(event.request);
      }),
   );
});
