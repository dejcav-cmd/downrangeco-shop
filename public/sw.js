const CACHE = "drco-v1";
const STATIC = ["/", "/products", "/about", "/pages/faq", "/pages/sizing-guide", "/logo.png", "/hero.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Network-first for API and cart
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/account")) {
    return e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({error:"offline"}), {headers:{"Content-Type":"application/json"}})));
  }
  // Cache-first for static assets
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|woff2|css|js)$/)) {
    return e.respondWith(caches.match(e.request).then(cached => cached ?? fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    })));
  }
  // Stale-while-revalidate for pages
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
      return cached ?? fresh;
    })
  );
});

// Push notifications (for future use)
self.addEventListener("push", e => {
  if (!e.data) return;
  const data = e.data.json();
  self.registration.showNotification(data.title ?? "Down Range Co.", {
    body:  data.body ?? "",
    icon:  "/pwa/icon-192.png",
    badge: "/pwa/icon-192.png",
    data:  { url: data.url ?? "/" },
  });
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
