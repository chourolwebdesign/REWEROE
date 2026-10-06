/* REWE Rödelheim – Service Worker
 * Seiten: erst Netz, bei Ausfall die zuletzt gesehene Kopie oder /offline.
 * Statische Dateien und Bilder: aus dem Cache (Dateinamen ändern sich bei jedem Build).
 * Nicht angefasst: Videos (Range-Anfragen), Kalender, Formulare, Daten für Seitenwechsel, Cockpit, API, Prospektbilder.
 */
const VERSION = "rr-2";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE_URL = "/offline";
const PRECACHE_PAGES = [OFFLINE_URL, "/", "/kontakt"];
const MAX_ASSETS = 150;
const MAX_PAGES = 30;

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const assets = await caches.open(ASSETS);
      for (const url of PRECACHE_PAGES) {
        try {
          const res = await fetch(url, { cache: "reload" });
          if (!res.ok) continue;
          await pages.put(url, res.clone());
          // Stylesheets der vorgeladenen Seiten mitnehmen, damit /offline auch beim ersten Besuch gestaltet ist.
          const html = await res.text();
          const css = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
          await Promise.all(css.map((href) => assets.add(href).catch(() => {})));
        } catch {}
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(`${VERSION}-`)).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Angemeldete Cockpit-Seiten nie zwischenspeichern; Prospektbilder sind groß und wechseln wöchentlich.
  if (/^\/(cockpit|api|prospekt-bilder)(\/|$)/.test(url.pathname)) return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = (await event.preloadResponse) || (await fetch(req));
          if (res.ok && res.type === "basic") {
            const cache = await caches.open(PAGES);
            await cache.put(url.pathname, res.clone());
            event.waitUntil(trim(PAGES, MAX_PAGES));
          }
          return res;
        } catch {
          const cache = await caches.open(PAGES);
          return (await cache.match(url.pathname)) || (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  const cacheable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:woff2|png|jpe?g|webp|avif|svg|ico)$/.test(url.pathname);
  if (!cacheable) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSETS);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok && res.status === 200) {
        await cache.put(req, res.clone());
        event.waitUntil(trim(ASSETS, MAX_ASSETS));
      }
      return res;
    })(),
  );
});
