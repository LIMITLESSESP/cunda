// Cunda: guarda la app para abrirla sin conexión.
// La página se pide primero a la red (así llegan las versiones nuevas) y, sin conexión, sale de la copia guardada.
// Al publicar una versión con cambios en la fuente o los iconos, sube VERSION.
var VERSION = "cunda-v1.3-2";
var FILES = ["/", "/index.html", "/manifest.webmanifest", "/fonts/onest.woff2", "/icons/icon.svg", "/icons/apple-touch-icon.png", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      // Solo se guarda la propia app (la portada); otras páginas no la sustituyen.
      var path = new URL(req.url).pathname;
      if (res.ok && (path === "/" || path === "/index.html")) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put("/", copy); }); }
      return res;
    }).catch(function () { return caches.match(req).then(function (hit) { return hit || caches.match("/"); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req); }));
});
