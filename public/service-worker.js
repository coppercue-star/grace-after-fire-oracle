// Minimal service worker — makes the app installable and ready for
// push notifications once OneSignal is added in Phase 6.

const CACHE_NAME = "gaf-oracle-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Basic offline fallback: try the network first, fall back to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
