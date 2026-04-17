const CACHE_NAME = 'v1'; // 🔁 CHANGE THIS EVERY TIME (v2, v3...)

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate new SW immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ACTIVATE (delete old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 🧹 remove old versions
          }
        })
      );
    })
  );

  self.clients.claim();
});

// FETCH (cache first, then network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          // save new files dynamically
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    }).catch(() => {
      // fallback if offline
      return caches.match('./index.html');
    })
  );
});

// 🔄 HANDLE UPDATE BUTTON CLICK
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // activate new version when user clicks update
  }
});
