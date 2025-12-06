// CEO Gála 2026 - Service Worker
const CACHE_NAME = 'ceogala-pwa-v2';
const OFFLINE_URL = '/pwa/offline';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/pwa',
  '/pwa/dashboard',
  '/pwa/ticket',
  '/pwa/profile',
  '/pwa/offline',
  '/manifest.json',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API requests (always go to network)
  if (url.pathname.startsWith('/api/')) return;

  // For PWA routes: network first, cache fallback
  if (url.pathname.startsWith('/pwa')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // For other assets: cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'CEO Gála értesítés',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'open',
        title: 'Megnyitás',
      },
      {
        action: 'close',
        title: 'Bezárás',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('CEO Gála 2025', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/pwa/dashboard')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-profile') {
    event.waitUntil(syncProfile());
  }
});

async function syncProfile() {
  // Sync any pending profile updates when back online
  const cache = await caches.open(CACHE_NAME);
  const pendingUpdates = await cache.match('/pending-profile-update');

  if (pendingUpdates) {
    const data = await pendingUpdates.json();
    try {
      await fetch('/api/pwa/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await cache.delete('/pending-profile-update');
    } catch (syncError) {
      // Profile sync failed, will retry on next sync event
      console.error('[SW] Profile sync failed:', syncError);
    }
  }
}
