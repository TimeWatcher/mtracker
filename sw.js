/* Simple cache-first SW for offline PWA */
const CACHE_NAME = "fit-pwa-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone@7.25.6/babel.min.js",
  "https://cdn.jsdelivr.net/npm/antd@5.18.3/dist/reset.css",
  "https://cdn.jsdelivr.net/npm/antd@5.18.3/dist/antd.min.css",
  "https://cdn.jsdelivr.net/npm/antd@5.18.3/dist/antd.min.js",
  "https://cdn.jsdelivr.net/npm/dayjs@1.11.11/dayjs.min.js"

];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Ignore non-GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>{});
        return resp;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
