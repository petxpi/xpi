const CACHE_NAME = 'xpipet-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// Instalación: Cachea los recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando recursos estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpia cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Sirve desde caché o red
self.addEventListener('fetch', (event) => {
  // Ignorar requests de API (siempre van a la red)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en caché, devolverlo
      if (response) {
        return response;
      }

      // Si no, hacer fetch a la red
      return fetch(event.request).then((fetchResponse) => {
        // Solo cachear respuestas válidas
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }

        // Clonar la respuesta para cachearla
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      });
    }).catch(() => {
      // Si falla todo, devolver página offline
      return caches.match('/');
    })
  );
});