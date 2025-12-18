const STATIC_CACHE = "static-v5";
const DYNAMIC_CACHE = "dynamic-v5";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./offline.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== location.origin) return;

  // 📸 Foto cache route
  if (url.pathname.includes("/photos/")) {
    event.respondWith(
      caches.open("photos-v1").then(cache =>
        cache.match(req).then(hit =>
          hit || new Response("", { status: 404 })
        )
      )
    );
    return;
  }

  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});



async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  const res = await fetch(req);
  const cache = await caches.open(DYNAMIC_CACHE);
  cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || caches.match("./offline.html");
  }
}
self.addEventListener("message", async (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_PHOTO") return;

  const { id, file } = data;
  if (!id || !file) return;

  const cache = await caches.open("photos-v1");
  const req = new Request(`/photos/${id}`);
  const res = new Response(file, { headers: { "Content-Type": file.type } });

  await cache.put(req, res);
});





