const CACHE_NAME = 'netlify-onof-v3';
const OFFLINE_PAGE = '/offline.html';

const ASSETS_TO_CACHE = [
'/',
'index.html',
'/offline.html',
'/manifest.json',
'/icon-192.png',
'/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // We reageren alleen op GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        // STAP 1: Kijk of het verzoek (of het nu een pagina, icoon of manifest is) in de cache staat
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Gevonden! Direct serveren (Index, Icons, etc.)
            }

            // STAP 2: Niet in de cache? (Zoals Page 2). Probeer het netwerk.
            return fetch(event.request).catch(() => {
                // STAP 3: Netwerk faalt én we zijn aan het navigeren? Geef de offline pagina.
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_PAGE);
                }
            });
        })
    );
});
