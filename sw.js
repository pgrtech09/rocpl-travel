// ROCPL Service Worker — Full PWA Offline Support
const CACHE_NAME = "rocpl-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./app.html",
  "./dashboard.html",
  "./manifest.json",
  "./css/style.css",
  "./js/config.js",
  "./js/auth.js",
  "./js/sheet.js",
  "./js/dashboard.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install — cache all assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", e => {
  // Skip Supabase API calls — always online
  if (e.request.url.includes("supabase.co")) return;
  // Skip Google Fonts — online only
  if (e.request.url.includes("fonts.googleapis") || e.request.url.includes("fonts.gstatic")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});